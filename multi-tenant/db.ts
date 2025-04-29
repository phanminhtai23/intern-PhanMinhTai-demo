// import { Pool, QueryResult, QueryResultRow } from 'pg';
// import fs from 'fs';
// import path from 'path';
// // Tải biến môi trường từ file .env
// import dotenv from 'dotenv';
// dotenv.config();

// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: parseInt(process.env.DB_PORT || '5432'),
// });

// // Hàm kết nối thử nghiệm
// export async function testConnection(): Promise<boolean> {
//     try {
//         const client = await pool.connect();
//         // console.log('Kết nối PostgreSQL thành công!');
//         client.release();
//         return true;
//     } catch (error) {
//         // console.error('Lỗi kết nối PostgreSQL:', error);
//         return false;
//     }
// }

// // Hàm thực thi truy vấn
// // Hàm thực thi truy vấn
// export async function query<T extends QueryResultRow>(text: string, params: any[] = []): Promise<QueryResult<T>> {
//     try {
//         const start = Date.now();
//         const res = await pool.query<T>(text, params);
//         const duration = Date.now() - start;
//         // console.log('Thực thi truy vấn:', { text, duration, rows: res.rowCount });
//         return res;
//     } catch (error) {
//         console.error('Lỗi thực thi truy vấn:', error);
//         throw error;
//     }
// }

// // Tạo một truy vấn transaction
// export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
//     const client = await pool.connect();
//     try {
//         await client.query('BEGIN');
//         const result = await callback(client);
//         await client.query('COMMIT');
//         return result;
//     } catch (e) {
//         await client.query('ROLLBACK');
//         throw e;
//     } finally {
//         client.release();
//     }
// }

// // Hàm chạy các script migration
// export async function runMigrations(): Promise<void> {
//     try {
//         const migrationsDir = './multi-tenant/migrations';
//         const files = fs.readdirSync(migrationsDir)
//             .filter(file => file.endsWith('.up.sql'))
//             .sort();

//         // console.log(`Tìm thấy ${files.length} file migration`);

//         for (const file of files) {
//             // console.log(`Đang chạy migration: ${file}`);
//             const filePath = path.join(migrationsDir, file);
//             const sql = fs.readFileSync(filePath, 'utf8');

//             await query(sql);
//             // console.log(`Đã chạy thành công migration: ${file}`);
//         }

//         // console.log('Tất cả migration đã được thực thi thành công!');
//     } catch (error) {
//         console.error('Lỗi khi chạy migration:', error);
//         throw error;
//     }
// }


// async function start() {
//     const isConnected = await testConnection();
//     if (!isConnected) {
//         console.error("Kết nối đến cơ sở dữ liệu thất bại");
//         return;
//     } else {
//         console.log("Kết nối đến cơ sở dữ liệu thành công");
//         await runMigrations();
//         console.log("Database migration đã được chạy thành công");
//     }
// }

// start()

// // Export pool để sử dụng trực tiếp nếu cần
// export { pool };