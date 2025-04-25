// import { api } from "encore.dev/api";
// import { runMigrations, testConnection, query } from './db';
// import { CLIENT_RENEG_LIMIT } from "node:tls";

// // import { SQLDatabase } from "encore.dev/storage/sqldb";

// // const db = new SQLDatabase("url", { migrations: "./migrations" });

// export const get = api(
//   { expose: true, method: "GET", path: "/ping" },
//   async(): Promise<Response> => {
//     return { message: "hello from The Farm" };
//   }
// );


// export type plan = {
//   id: string;
//   workspace_id: number;
//   name: string;
// };


// // GET /books - List all books
// export const listPlan = api(
//   { expose: true, method: "GET", path: "/plan" },
//   async (): Promise<{ plans: plan[] }> => {
//     const names: plan[] = [];

//     const test = await query(`SET app.workspace_id = 2`); // ID của workspace
//     if (test) {
//       console.log("SET biến thành công! Workspace ID:", test);
//       const checkResult = await query(`SELECT current_setting('app.workspace_id', true) AS workspace_id`);
//       console.log('SET biến thành công! Workspace ID:', checkResult.rows[0]?.workspace_id);
//     } 

//     const rows = await query<plan>(`SELECT * FROM plan`);    
//     // Kiểm tra an toàn trước khi sử dụng
//     if (rows && rows.rows) {
//       return { plans: rows.rows };
//     } else {
//       // Trả về mảng rỗng nếu không có kết quả
//       return { plans: [] };
//     }

//     // try {
//     //   const result = await query(`
//     // BEGIN;
//     // SET LOCAL app.workspace_id = 2;
//     // SELECT * FROM plan;
//     // COMMIT;
//     // `);

//     //   console.log('Kết quả truy vấn:', result);

//     //   // Kiểm tra null/undefined
//     //   const plans = result && result.rows ? result.rows : [];
//     //   console.log('Truy vấn với RLS thành công. Số bản ghi:', plans.length);
//     //   return { plans: (result?.rows || []) as plan[] };
//     // } catch (error) {
//     //   console.error('Truy vấn thất bại:', error);
//     //   return { plans: [] };
//     // }
//   }
// );


// interface Response {
//   message: string;
// }

// // Chạy migration khi khởi động ứng dụng
// async function start() {
//   const isConnected = await testConnection();
//   if (!isConnected) {
//     console.error("Kết nối đến cơ sở dữ liệu thất bại");
//     return;
//   } else {
//     console.log("Kết nối đến cơ sở dữ liệu thành công");
//     await runMigrations();
//     console.log("Database migration đã được chạy thành công");
//   }
// }

// start()

