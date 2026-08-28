-- H2 Compatible Schema (no JSONB support)
CREATE TABLE IF NOT EXISTS vehicles (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  plate VARCHAR(20) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
  km INTEGER NOT NULL DEFAULT 0,
  engine_hours INTEGER NOT NULL DEFAULT 0,
  fuel_level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drivers (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS missions (
  id VARCHAR(255) PRIMARY KEY,
  site VARCHAR(255) NOT NULL,
  client VARCHAR(255),
  vehicle_id VARCHAR(255) NOT NULL,
  driver_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'AFFECTEE',
  start_date DATE,
  end_date DATE,
  departure_km INTEGER,
  departure_engine_hours INTEGER,
  departure_fuel_level INTEGER,
  return_km INTEGER,
  return_engine_hours INTEGER,
  return_fuel_level INTEGER,
  budget INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

CREATE TABLE IF NOT EXISTS fuel_entries (
  id VARCHAR(255) PRIMARY KEY,
  mission_id VARCHAR(255) NOT NULL,
  driver_id VARCHAR(255) NOT NULL,
  quantity DOUBLE NOT NULL,
  cost INTEGER NOT NULL,
  station VARCHAR(255),
  receipt_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  FOREIGN KEY (mission_id) REFERENCES missions(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id VARCHAR(255) PRIMARY KEY,
  actor_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255),
  mission_id VARCHAR(255),
  details CLOB,
  created_at TIMESTAMP NOT NULL
);
