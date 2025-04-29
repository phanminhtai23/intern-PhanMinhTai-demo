import { query } from "../db/db";
import jwt from "jsonwebtoken";

// Define or import SECRET_KEY
const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";

export async function withWorkspaceContext<T>(
    workspaceId: number,
    token: string,
    callback: () => Promise<T>
): Promise<T> {
    // Kiểm tra workspaceId hợp lệ
    if (!workspaceId || isNaN(workspaceId)) {
        throw new Error(`Invalid workspace ID: ${workspaceId}`);
    }

    // Kiểm tra token hợp lệ
    if (!token || typeof token !== "string") {
        throw new Error("Invalid or missing token");
    }

    try {
        // Validate token (example logic, replace with your actual validation)
        const isValidToken = await query(`SELECT validate_token('${token}')`);
        if (!isValidToken) {
            throw new Error("Unauthorized: Invalid token");
        }

        // Thiết lập biến session `app.workspace_id`
        await query(`SET app.workspace_id = ${workspaceId}`);

        // Thực thi callback
        return await callback();
    } catch (error) {
        console.error("Error in workspace context middleware:", error);
        throw error;
    }
}


export async function verifyTokenWithRole<T>(
  requiredRole: string,
  req: { headers: { authorization?: string } },
  callback: (decodedToken: any) => Promise<T>
): Promise<T> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization token is missing or invalid");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

    if (typeof decodedToken !== "object" || decodedToken === null || decodedToken.role !== requiredRole) {
      throw new Error("Insufficient permissions");
    }

    return await callback(decodedToken);
  } catch (error) {
    console.error("Invalid token or insufficient permissions:", error);
    throw new Error("Invalid or expired token");
  }
}


export async function isAdmin(token: string): Promise<boolean> {
    try {
        const decodedToken = jwt.verify(token, SECRET_KEY);

        if (typeof decodedToken !== "object" || decodedToken === null) {
            throw new Error("Invalid token structure");
        }

        return decodedToken.role === "admin";
    } catch (error) {
        console.error("Error in isAdmin function:", error);
        return false; // Return false if token is invalid or any error occurs
    }
}

export async function verifyToken(
    token: string,
): Promise<boolean> {
    try {
        const decodedToken = jwt.verify(token, SECRET_KEY);

        if (typeof decodedToken !== "object" || decodedToken === null) {
            throw new Error("Invalid token structure");
        }

        if (decodedToken.exp && Date.now() >= decodedToken.exp * 1000) {
            throw new Error("Token has expired");
        }

        return true; // Token is valid and role matches
    } catch (error) {
        console.error("Error in role and token validation:", error);
        throw new Error("Invalid or expired token");
    }
}
