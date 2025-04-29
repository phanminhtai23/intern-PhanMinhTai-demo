
-- DROP POLICY IF EXISTS rls_plan_workspace_id ON plan;-- Xóa policy cũ nếu tồn tại, sau đó tạo lại
-- DROP POLICY IF EXISTS rls_workspace_id ON workspace;
-- DROP POLICY IF EXISTS tenant_isolation_policy ON plan;

-- DROP POLICY IF EXISTS tenant_isolation_policy ON plan;
-- DROP POLICY IF EXISTS workspace_isolation_policy ON workspace;

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

-- -- Create index on the foreign key for better performance
-- -- Tạo index chỉ khi chưa tồn tại
-- CREATE INDEX IF NOT EXISTS idx_plan_workspace_id ON plan(workspace_id);

-- ALTER TABLE plan ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plan FORCE ROW LEVEL SECURITY;

-- ALTER TABLE workspace ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workspace FORCE ROW LEVEL SECURITY;

-- CREATE POLICY tenant_isolation_policy ON plan
-- FOR ALL
-- USING (workspace_id = current_setting('app.workspace_id', true)::integer);

-- CREATE POLICY workspace_isolation_policy ON workspace
-- FOR ALL
-- USING (id = current_setting('app.workspace_id', true)::integer);


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