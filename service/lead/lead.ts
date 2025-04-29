import { api } from "encore.dev/api";
import { query } from "../../db/db";
import { verifyToken, isAdmin } from "../../middlewares/auth";
import { getUserWorkspace } from "../auth/auth";
import { withWorkspaceContext } from "../../middlewares/RLS";

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
        await verifyToken(token);

        const workspaceId = await getUserWorkspace(token);

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
        await verifyToken(token);

        const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Lead>('SELECT * FROM lead WHERE id = $1', [leadId]);
            if (result.rows.length === 0) {
                throw new Error("Lead not found");
            }

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
        await verifyToken(token);
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to create a lead");
        }

        const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Lead>(
                'INSERT INTO lead (workspace_id, name, email) VALUES ($1, $2, $3) RETURNING *',
                [workspaceId, body.name, body.email]
            );

            return { lead: result.rows[0] };
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
        await verifyToken(token);
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to update a lead");
        }

        const workspaceId = await getUserWorkspace(token);

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
        await verifyToken(token);
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to delete a lead");
        }

        const workspaceId = await getUserWorkspace(token);

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