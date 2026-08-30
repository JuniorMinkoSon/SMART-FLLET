-- Insert test users for development/testing
INSERT INTO users (id, email, password, name, role, enabled, created_at, updated_at) VALUES
-- ADMIN (password: admin123)
('00000000-0000-0000-0000-000000000001', 'admin@smartfleet.local', '$2a$10$4EARLqLHFoY/.kVLgEVlkOPzCvHfqzGvKJNcqLeQkMgc5h/0hpLvm', 'Admin', 'ADMIN', true, NOW(), NOW()),

-- GESTIONNAIRE (password: gestionnaire123)
('00000000-0000-0000-0000-000000000002', 'manager@smartfleet.local', '$2a$10$8xm0SJV5v.zy0ZNxkzf.8OlSx9H7u/2VKc5pKg6fYtXc9e/V.xWGi', 'Manager', 'GESTIONNAIRE', true, NOW(), NOW()),

-- CONDUCTEUR (password: driver123)
('00000000-0000-0000-0000-000000000003', 'driver@smartfleet.local', '$2a$10$7LKdE4vR2bNv0hCk5pF.3uV/JqW4mH8xL2oP0qR1sT9uV/WxYzZKi', 'Driver', 'CONDUCTEUR', true, NOW(), NOW());

-- Insert test drivers
INSERT INTO drivers (id, name, email, phone, status, skills, created_at, updated_at) VALUES
('00000000-0000-0000-0001-000000000001', 'Jean Dupont', 'driver@smartfleet.local', '+33612345678', 'DISPONIBLE', '{"CAMION","EXCAVATRICE"}', NOW(), NOW()),
('00000000-0000-0000-0001-000000000002', 'Marie Martin', 'marie@smartfleet.local', '+33612345679', 'DISPONIBLE', '{"CAMION"}', NOW(), NOW());

-- Insert test vehicles
INSERT INTO vehicles (id, code, type, license_plate, status, initial_km, current_km, engine_hours, fuel_level, created_at, updated_at) VALUES
('00000000-0000-0000-0002-000000000001', 'ENG-001', 'CAMION', 'CI-2024-001', 'DISPONIBLE', 50000, 50000, 2000, 80, NOW(), NOW()),
('00000000-0000-0000-0002-000000000002', 'ENG-002', 'EXCAVATRICE', 'CI-2024-002', 'DISPONIBLE', 30000, 30000, 1500, 60, NOW(), NOW());

-- Link CONDUCTEUR to first driver
UPDATE users SET driver_id = '00000000-0000-0000-0001-000000000001' WHERE id = '00000000-0000-0000-0000-000000000003';
