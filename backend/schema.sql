-- Smart Fleet Database Schema with Audit Trail
-- PostgreSQL 12+

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'gestionnaire', 'conducteur')),
  driver_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  matricule VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20),
  license VARCHAR(10),
  status VARCHAR(50) DEFAULT 'disponible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  plate VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'disponible',
  km INT DEFAULT 0,
  engine_hours INT DEFAULT 0,
  fuel_level INT DEFAULT 0,
  condition VARCHAR(50),
  site VARCHAR(255),
  driver_id INT REFERENCES drivers(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS missions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  site VARCHAR(255) NOT NULL,
  client VARCHAR(255),
  vehicle_id INT NOT NULL REFERENCES vehicles(id),
  driver_id INT NOT NULL REFERENCES drivers(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'planifiee',
  departure_km INT,
  departure_hours INT,
  departure_fuel INT,
  departure_time TIMESTAMP,
  arrival_km INT,
  arrival_hours INT,
  arrival_fuel INT,
  arrival_anomaly TEXT,
  arrival_time TIMESTAMP,
  created_by INT REFERENCES users(id),
  validated_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id INT NOT NULL,
  changes JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  mission_id INT REFERENCES missions(id),
  severity VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  detail TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_missions_vehicle ON missions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_missions_driver ON missions(driver_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name);

-- Insert default users
INSERT INTO users (email, password, name, role) VALUES
  ('admin@smartfleet.com', 'admin123', 'Admin', 'admin'),
  ('gestion@smartfleet.com', 'gestion123', 'Manager', 'gestionnaire'),
  ('conducteur@smartfleet.com', 'conduct123', 'Driver', 'conducteur')
ON CONFLICT DO NOTHING;

INSERT INTO drivers (name, matricule, phone, license) VALUES
  ('Driver 1', 'GS-OP-001', '+225 07 690 11 22 33', 'CE'),
  ('Driver 2', 'GS-OP-002', '+225 07 677 44 55 66', 'CE'),
  ('Driver 3', 'GS-OP-003', '+225 07 655 77 88 99', 'C'),
  ('Driver 4', 'GS-OP-004', '+225 07 699 00 11 22', 'CE'),
  ('Driver 5', 'GS-OP-005', '+225 07 676 33 44 55', 'CE'),
  ('Driver 6', 'GS-OP-006', '+225 07 691 66 77 88', 'C')
ON CONFLICT DO NOTHING;

INSERT INTO vehicles (code, type, name, plate, status, km, engine_hours, fuel_level, condition) VALUES
  ('P-001', 'Excavator', 'Hydraulic Excavator', 'CI-8842-LT', 'disponible', 128450, 4820, 82, 'Good'),
  ('B-002', 'Bulldozer', 'Bulldozer D6', 'CI-5521-DL', 'disponible', 84210, 3105, 64, 'Good'),
  ('N-003', 'Grader', 'Grader 140K', 'CI-7710-YA', 'maintenance', 152980, 6240, 18, 'Fair'),
  ('P-004', 'Excavator', 'Wheeled Excavator', 'CI-3308-DA', 'disponible', 96540, 3890, 45, 'Good'),
  ('C-005', 'Truck', 'Dump Truck', 'CI-1194-LT', 'disponible', 210330, 7150, 28, 'Good'),
  ('C-006', 'Truck', 'Water Truck', 'CI-6620-CE', 'disponible', 176800, 5980, 91, 'Good'),
  ('G-007', 'Crane', 'Mobile Crane', 'CI-0042-LT', 'disponible', 64200, 2210, 37, 'Fair'),
  ('EX-008', 'Compactor', 'Compactor Rental', 'CI-9915-DA', 'disponible', 41200, 1540, 58, 'Good'),
  ('P-009', 'Mini Excavator', 'Mini Excavator', 'CI-2277-YA', 'panne', 58900, 2050, 12, 'Poor'),
  ('B-010', 'Bulldozer', 'Bulldozer D8', 'CI-4471-CE', 'disponible', 112480, 4420, 76, 'Good')
ON CONFLICT DO NOTHING;
