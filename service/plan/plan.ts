import { api } from "encore.dev/api";
import { query, transaction } from "../../db/db";

// Plan type definition
export interface Plan {
    id: number;
    workspace_id: number;
    name: string;
}

// Request types
interface CreatePlanRequest {
    workspace_id: number;
    name: string;
}

interface UpdatePlanRequest {
    name: string;
}

// Helper function to set workspace context
// Helper function to set workspace context
async function withWorkspaceContext<T>(workspaceId: number, callback: () => Promise<T>): Promise<T> {
    // Kiểm tra workspaceId hợp lệ
    if (!workspaceId || isNaN(workspaceId)) {
        throw new Error(`Invalid workspace ID: ${workspaceId}`);
    }

    try {
        // Kiểm tra bảng plan
        const checkData = await query('SELECT COUNT(*) FROM plan');
        // console.log('Total records in plan:', checkData.rows[0]?.count);
        // console.log("workspaceId = ", workspaceId);

        // Đặt biến session trực tiếp với đối tượng query
        await query(`SET app.workspace_id = ${workspaceId}`);

        // Thực thi callback
        return await callback();
    } catch (error) {
        console.error("Error in workspace context:", error);
        throw error;
    }
}

// List all plans for a workspace
export const listPlans = api(
    { expose: true, method: "GET", path: "/workspaces/:workspaceId/plans" },
    async ({ workspaceId }: { workspaceId: string }): Promise<{ plans: Plan[] }> => {
        // Kiểm tra và chuyển đổi workspaceId
        const workspaceIdNum = parseInt(workspaceId);

        console.log("workspaceIdNum, = ", workspaceIdNum);

        if (isNaN(workspaceIdNum)) {
            throw new Error("Invalid workspace ID: must be a number");
        }

        return withWorkspaceContext(Number(workspaceIdNum), async () => {
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
        path: "/workspaces/:workspaceId/plans/:planId"
    },
    async ({ workspaceId, planId }: { workspaceId: number; planId: string }): Promise<{ plan: Plan }> => {
        return withWorkspaceContext(workspaceId, async () => {
            // await query<Plan>(`SET app.workspace_id = ${workspaceId}`);
            const result = await query<Plan>(`SELECT * FROM plan WHERE id = ${planId}`);
            if (result.rows.length === 0) {
                throw new Error("Plan not found");
            }

            return { plan: result.rows[0] };
        });
    }
);

// Create a new plan
export const createPlan = api(
    { expose: true, method: "POST", path: "/workspaces/:workspaceId/plans" },
    async (params: { workspaceId: number; body: CreatePlanRequest }): Promise<{ plan: Plan }> => {
        const { workspaceId, body } = params;

        // Validate that workspace_id in body matches URL parameter
        if (body.workspace_id !== workspaceId) {
            throw new Error("Workspace ID mismatch");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Plan>(
                'INSERT INTO plan (workspace_id, name) VALUES ($1, $2) RETURNING *',
                [body.workspace_id, body.name]
            );

            return { plan: result.rows[0] };
        });
    }
);

// Update a plan
export const updatePlan = api(
    { expose: true, method: "PUT", path: "/workspaces/:workspaceId/plans/:planId" },
    async (params: { workspaceId: string; planId: string; body: UpdatePlanRequest }): Promise<{ plan: Plan }> => {
        const { workspaceId, planId, body } = params;

        return withWorkspaceContext(parseInt(workspaceId), async () => {
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
    { expose: true, method: "DELETE", path: "/workspaces/:workspaceId/plans/:planId" },
    async ({ workspaceId, planId }: { workspaceId: string; planId: string }): Promise<{ success: boolean }> => {
        return withWorkspaceContext(parseInt(workspaceId), async () => {
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