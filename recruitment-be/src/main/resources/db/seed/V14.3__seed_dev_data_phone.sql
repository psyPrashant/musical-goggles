-- V14.3: Add cell phone numbers to seed candidates
-- Targets the 8 candidates seeded in V14.2 (mg-72 seed data).
-- Safe to run before those candidates exist — UPDATE with no matching rows is a no-op.
UPDATE candidates SET cell_phone = '+27 82 100 0001' WHERE id = '00000000-0000-0000-000a-000000000001';
UPDATE candidates SET cell_phone = '+27 83 200 0002' WHERE id = '00000000-0000-0000-000a-000000000002';
UPDATE candidates SET cell_phone = '+27 84 300 0003' WHERE id = '00000000-0000-0000-000a-000000000003';
UPDATE candidates SET cell_phone = '+27 71 400 0004' WHERE id = '00000000-0000-0000-000a-000000000004';
UPDATE candidates SET cell_phone = '+27 72 500 0005' WHERE id = '00000000-0000-0000-000a-000000000005';
UPDATE candidates SET cell_phone = '+27 73 600 0006' WHERE id = '00000000-0000-0000-000a-000000000006';
UPDATE candidates SET cell_phone = '+27 74 700 0007' WHERE id = '00000000-0000-0000-000a-000000000007';
UPDATE candidates SET cell_phone = '+27 76 800 0008' WHERE id = '00000000-0000-0000-000a-000000000008';
