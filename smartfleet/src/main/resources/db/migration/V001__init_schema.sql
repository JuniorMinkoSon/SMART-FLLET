-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    driver_id UUID,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Drivers table
CREATE TABLE drivers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    status VARCHAR(50) NOT NULL,
    skills TEXT[],
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    initial_km INTEGER NOT NULL,
    current_km INTEGER DEFAULT 0,
    engine_hours INTEGER DEFAULT 0,
    fuel_level INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Missions table
CREATE TABLE missions (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    site VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget INTEGER,
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    departure_km INTEGER,
    departure_engine_hours INTEGER,
    departure_fuel INTEGER,
    return_km INTEGER,
    return_engine_hours INTEGER,
    return_fuel INTEGER,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Fuel entries table
CREATE TABLE fuel_entries (
    id UUID PRIMARY KEY,
    mission_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    cost INTEGER NOT NULL,
    station VARCHAR(255),
    receipt_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (mission_id) REFERENCES missions(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Audit events table (JSONB for details)
CREATE TABLE audit_events (
    id UUID PRIMARY KEY,
    actor_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    mission_id UUID,
    details JSONB,
    created_at TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX idx_missions_vehicle_id ON missions(vehicle_id);
CREATE INDEX idx_missions_driver_id ON missions(driver_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_dates ON missions(start_date, end_date);
CREATE INDEX idx_fuel_entries_mission_id ON fuel_entries(mission_id);
CREATE INDEX idx_fuel_entries_driver_id ON fuel_entries(driver_id);
CREATE INDEX idx_audit_events_mission_id ON audit_events(mission_id);
CREATE INDEX idx_audit_events_actor_id ON audit_events(actor_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at);
