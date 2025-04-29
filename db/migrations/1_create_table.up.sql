
-- DROP POLICY IF EXISTS rls_plan_workspace_id ON plan;-- Xóa policy cũ nếu tồn tại, sau đó tạo lại
-- DROP POLICY IF EXISTS rls_workspace_id ON workspace;
-- DROP POLICY IF EXISTS tenant_isolation_policy ON plan;

-- DROP POLICY IF EXISTS tenant_isolation_policy ON plan;
-- DROP POLICY IF EXISTS workspace_isolation_policy ON workspace;

-- CREATE TABLE IF NOT EXISTS lead (
--     id SERIAL PRIMARY KEY,
--     workspace_id INT NOT NULL,
--     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW(),
--     CONSTRAINT fk_workspace_lead FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE
-- );

-- CREATE TABLE IF NOT EXISTS application (
--     id SERIAL PRIMARY KEY,
--     workspace_id INT NOT NULL,
--     lead_id INT NOT NULL,
--     status VARCHAR(100) NOT NULL,
--     submitted_at TIMESTAMP DEFAULT NOW(),
--     CONSTRAINT fk_workspace_application FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE,
--     CONSTRAINT fk_lead_application FOREIGN KEY (lead_id) REFERENCES lead(id) ON DELETE CASCADE
-- );

-- CREATE TABLE IF NOT EXISTS offer (
--     id SERIAL PRIMARY KEY,
--     workspace_id INT NOT NULL,
--     application_id INT NOT NULL,
--     amount DECIMAL(10,2) NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW(),
--     CONSTRAINT fk_workspace_offer FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE,
--     CONSTRAINT fk_application_offer FOREIGN KEY (application_id) REFERENCES application(id) ON DELETE CASCADE
-- );


-- Insert dữ liệu mẫu
-- Giả sử đã có workspace id = 1



-- -- Create workspace table
-- CREATE TABLE IF NOT EXISTS workspace (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL
-- );

-- -- Create plan table with foreign key constraint
-- CREATE TABLE IF NOT EXISTS plan (
--     id SERIAL PRIMARY KEY,
--     workspace_id INTEGER NOT NULL,
--     name VARCHAR(255) NOT NULL,
--     CONSTRAINT fk_workspace
--         FOREIGN KEY (workspace_id)
--         REFERENCES workspace(id)
--         ON DELETE CASCADE
-- );

-- CREATE TABLE  IF NOT EXISTS users (
--     id SERIAL PRIMARY KEY,               -- ID duy nhất cho mỗi người dùng
--     user_id VARCHAR(255) UNIQUE NOT NULL, -- ID người dùng từ Logto
--     email VARCHAR(255) UNIQUE NOT NULL,  -- Email của người dùng
--     password_hash TEXT NOT NULL,
--     role VARCHAR(50) NOT NULL,           -- Vai trò của người dùng (admin, user, etc.)
--     workspace_id INT NOT NULL,           -- Liên kết với workspace (multi-tenant)
--     created_at TIMESTAMP DEFAULT NOW(),  -- Thời gian tạo
--     updated_at TIMESTAMP DEFAULT NOW(),   -- Thời gian cập nhật
--     CONSTRAINT fk_workspace_on_user FOREIGN KEY (workspace_id) REFERENCES workspace(id) ON DELETE CASCADE
-- );



-- -- Create index on the foreign key for better performance
-- -- Tạo index chỉ khi chưa tồn tại
-- CREATE INDEX IF NOT EXISTS idx_plan_workspace_id ON plan(workspace_id);

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- ALTER TABLE plan ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plan FORCE ROW LEVEL SECURITY;

-- ALTER TABLE workspace ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workspace FORCE ROW LEVEL SECURITY;


-- ALTER TABLE lead ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE lead FORCE ROW LEVEL SECURITY;

-- ALTER TABLE application ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE application FORCE ROW LEVEL SECURITY;

-- ALTER TABLE offer ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE offer FORCE ROW LEVEL SECURITY;

-- -- Tạo chính sách RLS: mỗi workspace chỉ thấy dữ liệu của mình
-- CREATE POLICY lead_workspace_isolation ON lead
-- FOR ALL
-- USING (workspace_id = current_setting('app.workspace_id', true)::integer);

-- CREATE POLICY application_workspace_isolation ON application
-- FOR ALL
-- USING (workspace_id = current_setting('app.workspace_id', true)::integer);

-- CREATE POLICY offer_workspace_isolation ON offer
-- FOR ALL
-- USING (workspace_id = current_setting('app.workspace_id', true)::integer);


-- CREATE POLICY tenant_isolation_policy ON plan
-- FOR ALL
-- USING (workspace_id = current_setting('app.workspace_id', true)::integer);

-- CREATE POLICY workspace_isolation_policy ON workspace
-- FOR ALL
-- USING (id = current_setting('app.workspace_id', true)::integer);

-- CREATE POLICY user_isolation_policy ON users
-- FOR ALL
-- USING (workspace_id = current_setting('app.workspace_id', true)::integer);


-- -- Đặt trong hàm middleware hoặc trước mỗi truy vấn
-- -- SET app.workspace_id = 'WORKSPACE_ID';

-- -- CREATE ROLE myuser LOGIN PASSWORD '123' NOINHERIT;
-- -- GRANT SELECT ON plan TO myuser;


-- -- Cấp quyền cần thiết
-- -- GRANT CONNECT ON DATABASE current_database() TO user123;
-- -- GRANT USAGE ON SCHEMA public TO user123;
-- -- GRANT SELECT, INSERT, UPDATE, DELETE ON plan TO user123;
-- -- GRANT SELECT, INSERT, UPDATE, DELETE ON workspace TO user123;
-- -- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO user123;