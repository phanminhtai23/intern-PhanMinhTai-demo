import { api } from "encore.dev/api";
import { query } from "../../db/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Request type for user registration
interface RegisterRequest {
  username: string;
  password: string;
  workspace_id: number;
  // role:  "user" | "admin";
}

// Response type for user registration
interface RegisterResponse {
  success: boolean;
  message: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
}
// // API endpoint to get the current workspace settings
async function withWorkspaceContext<T>(workspaceId: number, callback: () => Promise<T>): Promise<T> {
  // Validate workspaceId
  if (!workspaceId || isNaN(workspaceId)) {
    throw new Error(`Invalid workspace ID: ${workspaceId}`);
  }

  try {
    // Set the workspace context for the session
    await query(`SET app.workspace_id = ${workspaceId}`);

    // Execute the callback within the workspace context
    return await callback();
  } catch (error) {
    console.error("Error in workspace context:", error);
    throw error;
  }
}

// API endpoint for user registration
export const registerUser = api(
  { expose: true, method: "POST", path: "/auth/register" },
  async ({ body }: { body: RegisterRequest }): Promise<RegisterResponse> => {
    const { username, password, workspace_id} = body;

    const role = "user";
    console.log("Registering user:", username, password, workspace_id, role);
    // Kiểm tra workspace_id có hợp lệ hay không
    // const workspaceCheck = await query(
    //   `SELECT id FROM workspace WHERE id = ${workspace_id}`);
    // if (workspaceCheck.rows.length === 0) {
    //   return {
    //     success: false,
    //     message: "Invalid workspace ID",
    //   };
    // }

    // Kiểm tra xem người dùng đã tồn tại chưa
    const userCheck = await withWorkspaceContext(workspace_id, async () => {
      return await query(
      "SELECT id FROM users WHERE user_id = $1",
      [username]
      );
    });
    if (userCheck.rows.length > 0) {
      return {
        success: false,
        message: "User already exists",
      };
    }

    // Mã hóa mật khẩu
    const password_hash = await bcrypt.hash(password, 10);

    // Lưu người dùng vào cơ sở dữ liệu
    try {
        await query(
            "INSERT INTO users (user_id, email, password_hash, role, workspace_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())",
            [username, username, password_hash, role, workspace_id]
        );

      return {
        success: true,
        message: "User registered successfully",
      };
    } catch (error) {
      console.error("Error inserting user:", error);
      return {
        success: false,
        message: "Failed to register user",
      };
    }
  }
);


// // Request type for user login
// interface LoginRequest {
//   username: string;
//   password: string;
//   workspace_id: number;
// }

// // Response type for user login
// interface LoginResponse {
//   success: boolean;
//   message: string;
//   token?: string;
// }

// API endpoint for user login
export const loginUser = api(
  { expose: true, method: "POST", path: "/auth/login" },
  async ({ body }: { body: LoginRequest }): Promise<LoginResponse> => {
    const { username, password} = body;

    console.log("Logging in user:", username);

    // get workspace_id from the database
    const workspace_id = await getUserWorkspace(username);
    // console.log("workspace_id3", workspace_id3);
    // const workspace_id = 1

    // Check if the user exists
    const userCheck = await withWorkspaceContext(workspace_id, async () => {
      return await query(
        'SELECT id, password_hash, role FROM users WHERE user_id = $1',
        [username]
      );
    });
    // const workspace_id1 = await getUserWorkspace(username);
    // console.log("workspace_id1", workspace_id1);
    if (userCheck.rows.length === 0) {
      return {
        success: false,
        message: "Invalid username or password",
      };
    }

    const user = userCheck.rows[0];

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid username or password",
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: username,
        role: user.role,
        workspace_id: workspace_id,
      },
      process.env.JWT_SECRET || "your_jwt_secret", // Replace with a secure secret in production
      { expiresIn: "1h" }
    );

    return {
      success: true,
      message: "Login successful",
      token,
    };
  }
);

export async function getUserWorkspace(user_id: string): Promise<number> {
  // console.log("user_id received:", user_id); // Kiểm tra giá trị user_id
  const result = await query(
    "SELECT workspace_id FROM users WHERE user_id = $1", // $1 đại diện cho tham số đầu tiên
    [user_id] // truyền mảng tham số vào
  );
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0].workspace_id;
}
