import { api } from "encore.dev/api";
import { query } from "../../db/db";
import { verifyToken, isAdmin } from "../../middlewares/auth";
import { getUserWorkspace } from "../auth/auth";
import { withWorkspaceContext } from "../../middlewares/RLS";

// Application type definition
export interface Application {
    id: number;
    workspace_id: number;
    lead_id: number;
    status: string;
    submitted_at: string;
}

// Request types
interface CreateApplicationRequest {
    lead_id: number;
    status: string;
}

interface UpdateApplicationRequest {
    status?: string;
}

// List all applications for a workspace
export const listApplications = api(
    { expose: true, method: "GET", path: "/workspaces/applications" },
    async ({ token }: { token: string }): Promise<{ applications: Application[] }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        await verifyToken(token);

        const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(Number(workspaceId), async () => {
            const result = await query<Application>('SELECT * FROM application WHERE workspace_id = $1', [workspaceId]);
            return { applications: result.rows };
        });
    }
);

// Get a single application by ID
export const getApplication = api(
    {
        expose: true,
        method: "GET",
        path: "/workspaces/applications/:applicationId"
    },
    async ({ token, applicationId }: { token: string; applicationId: string }): Promise<{ application: Application }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        await verifyToken(token);

        const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Application>(
                'SELECT * FROM application WHERE id = $1 AND workspace_id = $2',
                [applicationId, workspaceId]
            );
            if (result.rows.length === 0) {
                throw new Error("Application not found");
            }

            return { application: result.rows[0] };
        });
    }
);

// Create a new application
export const createApplication = api(
    { expose: true, method: "POST", path: "/workspaces/applications" },
    async ({ body, token }: { body: CreateApplicationRequest; token: string }): Promise<{ application: Application }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        await verifyToken(token);
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to create an application");
        }

        const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Application>(
                'INSERT INTO application (workspace_id, lead_id, status) VALUES ($1, $2, $3) RETURNING *',
                [workspaceId, body.lead_id, body.status]
            );

            return { application: result.rows[0] };
        });
    }
);

// Update an application
export const updateApplication = api(
    { expose: true, method: "PUT", path: "/workspaces/applications/:applicationId" },
    async ({ token, applicationId, body }: { token: string; applicationId: string; body: UpdateApplicationRequest }): Promise<{ application: Application }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        await verifyToken(token);
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to update an application");
        }

        const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Application>(
                'UPDATE application SET status = COALESCE($1, status) WHERE id = $2 AND workspace_id = $3 RETURNING *',
                [body.status, applicationId, workspaceId]
            );

            if (result.rows.length === 0) {
                throw new Error("Application not found or belongs to another workspace");
            }

            return { application: result.rows[0] };
        });
    }
);

// Delete an application
export const deleteApplication = api(
    { expose: true, method: "DELETE", path: "/workspaces/applications/:applicationId" },
    async ({ token, applicationId }: { token: string; applicationId: string }): Promise<{ success: boolean }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        await verifyToken(token);
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to delete an application");
        }

        const workspaceId = await getUserWorkspace(token);

        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query(
                'DELETE FROM application WHERE id = $1 AND workspace_id = $2 RETURNING id',
                [applicationId, workspaceId]
            );

            if (result.rows.length === 0) {
                throw new Error("Application not found or belongs to another workspace");
            }

            return { success: true };
        });
    }
);