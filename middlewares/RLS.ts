import { query, transaction } from "../db/db";

export async function withWorkspaceContext<T>(workspaceId: number, callback: () => Promise<T>): Promise<T> {
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