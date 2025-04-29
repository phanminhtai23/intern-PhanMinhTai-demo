import { query } from "../db/db.js";
import jwt from "jsonwebtoken";

export async function getUserWorkspace(user_id: string): Promise<number> {
  // console.log("user_id received:", user_id); // Kiểm tra giá trị user_id
  const result = await query(
    "SELECT workspace_id FROM users WHERE user_id = $1",
    [user_id]
  );
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0].workspace_id;
}

interface user_infor {
    user_id: number;
    email: string;
    workspace_id: number;
}


export async function getUserInfoFromToken(token: string): Promise<{ user: user_infor }> {
    try {
        const decoded: any = jwt.verify(token, "your_secret_key"); // Replace "your_secret_key" with your actual secret key
        const user_id = decoded.user_id;
        if (!user_id) {
            throw new Error("Invalid token: user_id not found");
        }
        const result = await query("SELECT user_id, email, workspace_id FROM users WHERE user_id = $1", [user_id]);
        if (result.rows.length === 0) {
            throw new Error("User not found");
        }
        const user: user_infor = result.rows[0] as user_infor;

        return { user };
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}