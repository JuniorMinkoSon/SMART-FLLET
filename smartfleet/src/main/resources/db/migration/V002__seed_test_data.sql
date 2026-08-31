-- SmartFleet Test Data Seed
-- Version 1.0

-- Insert Users
INSERT INTO users (id, email, password, name, role, enabled) VALUES
('user-admin-1', 'admin@smartfleet.com', '$2a$10$SlVZQWumf5NsZhYqF5WXquCLHvPSUkhPyqZCiVUvgJiPXX8Jt1Zim', 'Administrateur', 'ADMIN', TRUE),
('user-gest-1', 'gestion@smartfleet.com', '$2a$10$SlVZQWumf5NsZhYqF5WXquCLHvPSUkhPyqZCiVUvgJiPXX8Jt1Zim', 'Gestionnaire de flotte', 'GESTIONNAIRE', TRUE),
('user-cond-1', 'conducteur@smartfleet.com', '$2a$10$SlVZQWumf5NsZhYqF5WXquCLHvPSUkhPyqZCiVUvgJiPXX8Jt1Zim', 'Moussa Koné', 'CONDUCTEUR', TRUE);

-- Drivers will be created via API, not via migration

-- Insert Vehicles
INSERT INTO vehicles (id, code, type, license_plate, status, initial_km, current_km, engine_hours, fuel_level) VALUES
('vehicle-1', 'ENG-001', 'Camion', 'CI-4521-AB', 'DISPONIBLE', 52000, 52340, 2100, 80),
('vehicle-2', 'ENG-002', 'Pelle', 'CI-8830-CD', 'DISPONIBLE', 12000, 12480, 1450, 65),
('vehicle-3', 'ENG-003', 'Bulldozer', 'CI-5555-EF', 'DISPONIBLE', 8500, 8750, 950, 70),
('vehicle-4', 'ENG-004', 'Excavateur', 'CI-6666-GH', 'DISPONIBLE', 15000, 15340, 1800, 75),
('vehicle-5', 'ENG-005', 'Camion Grue', 'CI-7777-IJ', 'DISPONIBLE', 20000, 20120, 2200, 75);

-- Missions and fuel entries will be created via API

-- Insert audit events (system initialization)
INSERT INTO audit_events (id, actor_id, event_type, entity_type, entity_id) VALUES
('audit-1', 'user-admin-1', 'SYSTEM_INIT', 'DATABASE', 'smartfleet-db'),
('audit-2', 'user-admin-1', 'DATA_SEED', 'USERS', 'user-admin-1'),
('audit-3', 'user-admin-1', 'DATA_SEED', 'DRIVERS', 'driver-1'),
('audit-4', 'user-admin-1', 'DATA_SEED', 'VEHICLES', 'vehicle-1');

-- Note: Passwords are bcrypt hashed versions of 'admin123', 'gestion123', 'conduct123'
-- Hash: $2a$10$SlVZQWumf5NsZhYqF5WXquCLHvPSUkhPyqZCiVUvgJiPXX8Jt1Zim
