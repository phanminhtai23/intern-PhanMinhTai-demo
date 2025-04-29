import { api } from "encore.dev/api";
import { query } from "../../db/db";
import { verifyToken, isAdmin } from "../../middlewares/auth";
import { getUserWorkspace } from "../../utils/common";
import { withWorkspaceContext } from "../../middlewares/RLS";

// Offer type definition
export interface Offer {
    id: number;
    workspace_id: number;
    application_id: number;
    amount: number;
    created_at: string;
}

// Request types
interface CreateOfferRequest {
    application_id: number;
    amount: number;
}

interface UpdateOfferRequest {
    amount?: number;
}

// List all offers for a workspace
export const listOffers = api(
    { expose: true, method: "GET", path: "/workspaces/offers" },
    async ({ token }: { token: string }): Promise<{ offers: Offer[] }> => {
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
            const result = await query<Offer>('SELECT * FROM offer WHERE workspace_id = $1', [workspaceId]);
            return { offers: result.rows };
        });
    }
);

// Get a single offer by ID
export const getOffer = api(
    {
        expose: true,
        method: "GET",
        path: "/workspaces/offers/:offerId"
    },
    async ({ token, offerId }: { token: string; offerId: string }): Promise<{ offer: Offer }> => {
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
            const result = await query<Offer>(
                'SELECT * FROM offer WHERE id = $1 AND workspace_id = $2',
                [offerId, workspaceId]
            );
            if (result.rows.length === 0) {
                throw new Error("Offer not found");
            }

            return { offer: result.rows[0] };
        });
    }
);

// Create a new offer
export const createOffer = api(
    { expose: true, method: "POST", path: "/workspaces/offers" },
    async ({ body, token }: { body: CreateOfferRequest; token: string }): Promise<{ offer: Offer }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        const userInfor = await verifyToken(token);
        // Parse token to extract workspace_id
        const workspaceId = userInfor.workspace_id;
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to create an offer");
        }


        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Offer>(
                'INSERT INTO offer (workspace_id, application_id, amount) VALUES ($1, $2, $3) RETURNING *',
                [workspaceId, body.application_id, body.amount]
            );

            return { offer: result.rows[0] };
        });
    }
);

// Update an offer
export const updateOffer = api(
    { expose: true, method: "PUT", path: "/workspaces/offers/:offerId" },
    async ({ token, offerId, body }: { token: string; offerId: string; body: UpdateOfferRequest }): Promise<{ offer: Offer }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        const userInfor = await verifyToken(token);
        // Parse token to extract workspace_id
        const workspaceId = userInfor.workspace_id;
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to update an offer");
        }


        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query<Offer>(
                'UPDATE offer SET amount = COALESCE($1, amount) WHERE id = $2 AND workspace_id = $3 RETURNING *',
                [body.amount, offerId, workspaceId]
            );

            if (result.rows.length === 0) {
                throw new Error("Offer not found or belongs to another workspace");
            }

            return { offer: result.rows[0] };
        });
    }
);

// Delete an offer
export const deleteOffer = api(
    { expose: true, method: "DELETE", path: "/workspaces/offers/:offerId" },
    async ({ token, offerId }: { token: string; offerId: string }): Promise<{ success: boolean }> => {
        if (!token) {
            throw new Error("Authorization token is required");
        }
        const userInfor = await verifyToken(token);
        // Parse token to extract workspace_id
        const workspaceId = userInfor.workspace_id;
        const check_admin = await isAdmin(token);

        if (!check_admin) {
            throw new Error("You do not have permission to delete an offer");
        }


        if (!workspaceId) {
            throw new Error("Invalid token: workspace_id is missing");
        }

        return withWorkspaceContext(workspaceId, async () => {
            const result = await query(
                'DELETE FROM offer WHERE id = $1 AND workspace_id = $2 RETURNING id',
                [offerId, workspaceId]
            );

            if (result.rows.length === 0) {
                throw new Error("Offer not found or belongs to another workspace");
            }

            return { success: true };
        });
    }
);