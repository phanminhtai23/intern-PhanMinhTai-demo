import { api } from "encore.dev/api";
import { query } from "../../db/db";
import { verifyToken, isAdmin } from "../../middlewares/auth";
import { getUserWorkspace } from "../../utils/common";
import { withWorkspaceContext } from "../../middlewares/RLS";
import { logger } from "../../utils/log"
import { startWorker } from "../../utils/worker";
// import { snsClient } from "../../utils/AWS_SNS";

startWorker().catch((error) => {
    console.error("Worker failed to start:", error);
    logger.error("Worker failed to start", { error: error.message });
});

// AWS SNS SDK
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const REGION = process.env.AWS_REGION || 'us-east-1';
const TOPIC_ARN = process.env.LEAD_NEW_TOPIC_ARN!; // ARN của SNS topic “Lead.New”

const snsClient = new SNSClient({ region: REGION });

// Lead type definition
export interface Lead {
    id: number;
    workspace_id: number;
    name: string;
    email: string;
}

// Request types
interface CreateLeadRequest {
    name: string;
    email: string;
}

interface UpdateLeadRequest {
    name?: string;
    email?: string;
}

// List all leads for a workspace
export const listLeads = api(
    { expose: true, method: "GET", path: "/workspaces/leads" },
    async ({ token }: { token: string }): Promise<{ leads: Lead[] }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        const userInfor = await verifyToken(token);
        // Parse token to extract workspace_id
        const workspaceId = userInfor.workspace_id;

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(Number(workspaceId), async () => {
            const result = await query<Lead>('SELECT * FROM lead');
            return { leads: result.rows };
        });
    }
);

// Get a single lead by ID
export const getLead = api(
    {
        expose: true,
        method: "GET",
        path: "/workspaces/leads/:leadId"
    },
    async ({ token, leadId }: { token: string; leadId: string }): Promise<{ lead: Lead }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        const userInfor = await verifyToken(token);
        // Parse token to extract workspace_id
        const workspaceId = userInfor.workspace_id;

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Lead>('SELECT * FROM lead WHERE id = $1', [leadId]);
            if (result.rows.length === 0) {
                throw new Error("Lead not found");
            }

            // log
            const log = {
                userId: userInfor.username,
                workspaceId: userInfor.workspace_id,
                details: { role: userInfor.role },
                status: "SUCCESS"
            }

            logger.info("getLead", log);

            console.log("Log: ", log);


            return { lead: result.rows[0] };
        });
    }
);

// Create a new lead
export const createLead = api(
    { expose: true, method: "POST", path: "/workspaces/leads" },
    async ({ body, token }: { body: CreateLeadRequest; token: string }): Promise<{ lead: Lead }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        // 1. Xác thực token & phân quyền
        const userInfo = await verifyToken(token);
        const workspaceId = userInfo.workspace_id;
        if (!await isAdmin(token)) {
        throw new Error('You do not have permission to create a lead');
        }
        if (!workspaceId) throw new Error('Invalid token: workspace_id is missing');

        // 2. Trong context workspace, tạo lead
        return await withWorkspaceContext(workspaceId, async () => {
            const result = await query<Lead>(
                'INSERT INTO lead (workspace_id, name, email) VALUES ($1, $2, $3) RETURNING *',
                [workspaceId, body.name, body.email]
            );
            const lead = result.rows[0];
            console.log("Lead created:", lead);
            // 3. Publish event lên SNS
            const messagePayload = JSON.stringify({
                id: lead.id,
                workspace_id: lead.workspace_id,
                name: lead.name,
                email: lead.email,
            });
            await snsClient.send(
                new PublishCommand({
                TopicArn: TOPIC_ARN,
                Message: messagePayload,
                Subject: 'Lead.New',
                })
            );

            return { lead };
        });
    }
);

// Update a lead
export const updateLead = api(
    { expose: true, method: "PUT", path: "/workspaces/leads/:leadId" },
    async ({ token, leadId, body }: { token: string; leadId: string; body: UpdateLeadRequest }): Promise<{ lead: Lead }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        const userInfor = await verifyToken(token);
        // Parse token to extract workspace_id
        const workspaceId = userInfor.workspace_id;
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to update a lead");
        }


        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Lead>(
                'UPDATE lead SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING *',
                [body.name, body.email, leadId]
            );

            if (result.rows.length === 0) {
                throw new Error("Lead not found or belongs to another workspace");
            }

            return { lead: result.rows[0] };
        });
    }
);

// Delete a lead
export const deleteLead = api(
    { expose: true, method: "DELETE", path: "/workspaces/leads/:leadId" },
    async ({ token, leadId }: { token: string; leadId: string }): Promise<{ success: boolean }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        const userInfor = await verifyToken(token);
        // Parse token to extract workspace_id
        const workspaceId = userInfor.workspace_id;
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to delete a lead");
        }


        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query(
                'DELETE FROM lead WHERE id = $1 RETURNING id',
                [leadId]
            );

            if (result.rows.length === 0) {
                throw new Error("Lead not found or belongs to another workspace");
            }

            return { success: true };
        });
    }
);