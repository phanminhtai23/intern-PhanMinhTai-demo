import { api, Header } from "encore.dev/api";
import { query, transaction } from "../../db/db";
import { verifyToken, isAdmin } from "../../middlewares/auth";
import { IncomingHttpHeaders } from 'http';
import { getUserWorkspace} from "../auth/auth"
import { withWorkspaceContext } from "../../middlewares/RLS"

// Plan type definition
export interface Plan {
    id: number;
    workspace_id: number;
    name: string;
}

// Request types
interface CreatePlanRequest {
    // workspace_id: number;
    name: string;
}

interface UpdatePlanRequest {
    name: string;
}

// Helper function to set workspace context
// Helper function to set workspace context


// List all plans for a workspace
export const listPlans = api(
    { expose: true, method: "GET", path: "/workspaces/plans" },
    async ({ token }: { token: string }): Promise<{ plans: Plan[] }> => {
        // Kiểm tra và chuyển đổi workspaceId
        // Extract token from headers
        if (!token) {
            throw new Error("Authorization token is required");
        }
        await verifyToken(token);

        // Parse token to extract workspace_id
        const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        console.log("workspaceIdNum, = ", workspaceId);

        return withWorkspaceContext(Number(workspaceId), async () => {
            const result = await query<Plan>('SELECT * FROM plan');
            return { plans: result.rows };
        });
    }
);

// Get a single plan by ID
export const getPlan = api(
    {
        expose: true,
        method: "GET",
        path: "/workspaces/plans/:planId"
    },
    async ({ token, planId }: { token: string; planId: string }): Promise<{ plan: Plan }> => {
        // Extract token from headers
        await verifyToken(token);

        if (!token) {
            throw new Error("Authorization token is required");
        }
        // Parse token to extract workspace_id
       const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing or invalid");
        }

        // Validate token and role
        
        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Plan>('SELECT * FROM plan WHERE id = $1', [planId]);
            if (result.rows.length === 0) {
                throw new Error("Plan not found");
            }

            return { plan: result.rows[0] };
        });
    }
);

// Create a new plan
export const createPlan = api(
    { expose: true, method: "POST", path: "/workspaces/plans" },
    async ({ body, token }: { body: CreatePlanRequest; token: string }): Promise<{ plan: Plan }> => {

        if (!token) {
            throw new Error("Authorization token is required");
        }
        await verifyToken(token);
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to create a plan");
        }
        // Parse token to extract workspace_id
        const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Plan>(
                'INSERT INTO plan (workspace_id, name) VALUES ($1, $2) RETURNING *',
                [workspaceId, body.name]
            );

            return { plan: result.rows[0] };
        });
    }
);

// Update a plan
export const updatePlan = api(
    { expose: true, method: "PUT", path: "/workspaces/plans/:planId" },
    async ({ token, planId, body }: { token: string; planId: string; body: UpdatePlanRequest }): Promise<{ plan: Plan }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        await verifyToken(token);
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to update a plan");
        }

        // Parse token to extract workspace_id
        const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Plan>(
                'UPDATE plan SET name = $1 WHERE id = $2 RETURNING *',
                [body.name, planId]
            );

            if (result.rows.length === 0) {
                throw new Error("Plan not found or belongs to another workspace");
            }

            return { plan: result.rows[0] };
        });
    }
);

// Delete a plan
export const deletePlan = api(
    { expose: true, method: "DELETE", path: "/workspaces/plans/:planId" },
    async ({ token, planId }: { token: string; planId: string }): Promise<{ success: boolean }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        await verifyToken(token);
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to delete a plan");
        }

        // Parse token to extract workspace_id
        const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query(
                'DELETE FROM plan WHERE id = $1 RETURNING id',
                [planId]
            );

            if (result.rows.length === 0) {
                throw new Error("Plan not found or belongs to another workspace");
            }

            return { success: true };
        });
    }
);