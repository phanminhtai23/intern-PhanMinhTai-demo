-- -- Thêm dữ liệu mẫu cho bảng workspace
-- INSERT INTO workspace (name) VALUES
-- ('Workspace A'),
-- ('Workspace B'),
-- ('Workspace C'),
-- ('Workspace D');

-- -- Thêm dữ liệu mẫu cho bảng plan
-- INSERT INTO plan (workspace_id, name) VALUESa
-- (1, 'Basic Plan - Workspace A'),
-- (1, 'Premium Plan - Workspace A'),
-- (1, 'Enterprise Plan - Workspace A'),
-- (2, 'Starter Plan - Workspace B'),
-- (2, 'Business Plan - Workspace B'),
-- (3, 'Free Plan - Workspace C'),
-- (3, 'Pro Plan - Workspace C'),
-- (4, 'Standard Plan - Workspace D');


-- INSERT INTO lead (workspace_id, name, email) VALUES
-- (1, 'Alice', 'alice@example.com'),
-- (1, 'Bob', 'bob@example.com');

-- INSERT INTO application (workspace_id, lead_id, status) VALUES
-- (1, 1, 'submitted'),
-- (1, 2, 'pending');

-- INSERT INTO offer (workspace_id, application_id, amount) VALUES
-- (1, 1, 10000.00),
-- (1, 2, 15000.00);
