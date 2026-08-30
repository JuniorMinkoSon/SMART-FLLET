import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'

const app = express()
app.use(cors())
app.use(express.json())

// SQLite Database (easier than PostgreSQL for MVP)
const db = new Database('./smartfleet.db')
db.pragma('journal_mode = WAL')

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'gestionnaire', 'conducteur')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    matricule TEXT UNIQUE,
    phone TEXT,
    license TEXT,
    status TEXT DEFAULT 'disponible',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT,
    name TEXT,
    plate TEXT UNIQUE,
    status TEXT DEFAULT 'disponible',
    km INTEGER,
    engine_hours INTEGER,
    fuel_level INTEGER,
    condition TEXT,
    site TEXT,
    driver_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    site TEXT,
    client TEXT,
    vehicle_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    start_date TEXT,
    end_date TEXT,
    budget INTEGER,
    status TEXT DEFAULT 'planifiee',
    departure_km INTEGER,
    departure_time TEXT,
    arrival_km INTEGER,
    arrival_time TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    action TEXT,
    table_name TEXT,
    record_id INTEGER,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY,
    mission_id INTEGER,
    severity TEXT,
    title TEXT,
    detail TEXT,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// Insert default data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count
if (userCount === 0) {
  db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run('admin@smartfleet.com', 'admin123', 'Admin', 'admin')
  db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run('gestion@smartfleet.com', 'gestion123', 'Manager', 'gestionnaire')
  db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run('conducteur@smartfleet.com', 'conduct123', 'Driver', 'conducteur')

  db.prepare('INSERT INTO drivers (name, matricule) VALUES (?, ?)').run('Driver 1', 'GS-OP-001')
  db.prepare('INSERT INTO drivers (name, matricule) VALUES (?, ?)').run('Driver 2', 'GS-OP-002')
  db.prepare('INSERT INTO drivers (name, matricule) VALUES (?, ?)').run('Driver 3', 'GS-OP-003')
  db.prepare('INSERT INTO drivers (name, matricule) VALUES (?, ?)').run('Driver 4', 'GS-OP-004')

  db.prepare('INSERT INTO vehicles (code, type, name, plate, km, engine_hours, fuel_level) VALUES (?, ?, ?, ?, ?, ?, ?)').run('P-001', 'Excavator', 'Hydraulic', 'CI-8842-LT', 128450, 4820, 82)
  db.prepare('INSERT INTO vehicles (code, type, name, plate, km, engine_hours, fuel_level) VALUES (?, ?, ?, ?, ?, ?, ?)').run('B-002', 'Bulldozer', 'Bulldozer D6', 'CI-5521-DL', 84210, 3105, 64)
  db.prepare('INSERT INTO vehicles (code, type, name, plate, km, engine_hours, fuel_level) VALUES (?, ?, ?, ?, ?, ?, ?)').run('P-004', 'Excavator', 'Wheeled', 'CI-3308-DA', 96540, 3890, 45)
  db.prepare('INSERT INTO vehicles (code, type, name, plate, km, engine_hours, fuel_level) VALUES (?, ?, ?, ?, ?, ?, ?)').run('C-005', 'Truck', 'Dump', 'CI-1194-LT', 210330, 7150, 28)
}

// Audit logging middleware
function logAudit(userId, action, tableName, recordId, details = {}) {
  db.prepare('INSERT INTO audit_logs (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)').run(
    userId, action, tableName, recordId, JSON.stringify(details)
  )
}

// RBAC middleware
function requireRole(roles) {
  return (req, res, next) => {
    const user = req.user
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' })
    }
    next()
  }
}

// Auth middleware (simple JWT-like)
app.use((req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const userId = parseInt(authHeader.substring(7))
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (user) req.user = user
  }
  next()
})

// ===== AUTH ENDPOINTS =====
app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  const user = db.prepare('SELECT id, email, name, role FROM users WHERE email = ? AND password = ?').get(email, password)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  logAudit(user.id, 'LOGIN', 'users', user.id)
  res.json({ ...user, token: user.id })
})

app.post('/api/register', (req, res) => {
  const { email, password, name, role } = req.body
  if (!email || !password || !name || !role) return res.status(400).json({ error: 'Missing fields' })
  if (!['admin', 'gestionnaire', 'conducteur'].includes(role)) return res.status(400).json({ error: 'Invalid role' })

  try {
    const stmt = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
    const result = stmt.run(email, password, name, role)
    const user = { id: result.lastInsertRowid, email, name, role, token: result.lastInsertRowid }
    logAudit(user.id, 'REGISTER', 'users', user.id)
    res.json(user)
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' })
  }
})

// ===== VEHICLES ENDPOINTS =====
app.get('/api/vehicles', (req, res) => {
  const vehicles = db.prepare('SELECT * FROM vehicles').all()
  res.json(vehicles)
})

app.post('/api/vehicles', requireRole(['admin', 'gestionnaire']), (req, res) => {
  const { code, type, name, plate } = req.body
  const stmt = db.prepare('INSERT INTO vehicles (code, type, name, plate) VALUES (?, ?, ?, ?)')
  const result = stmt.run(code, type, name, plate)
  logAudit(req.user.id, 'CREATE', 'vehicles', result.lastInsertRowid, { code, type, name })
  res.json({ id: result.lastInsertRowid, code, type, name, plate })
})

// ===== DRIVERS ENDPOINTS =====
app.get('/api/drivers', (req, res) => {
  const drivers = db.prepare('SELECT * FROM drivers').all()
  res.json(drivers)
})

// ===== MISSIONS ENDPOINTS =====
app.get('/api/missions', (req, res) => {
  const missions = db.prepare('SELECT * FROM missions').all()
  res.json(missions)
})

app.post('/api/missions', requireRole(['admin', 'gestionnaire']), (req, res) => {
  const { site, client, vehicle_id, driver_id, start_date, end_date, budget } = req.body
  const code = `MS-${Date.now()}`
  const stmt = db.prepare('INSERT INTO missions (code, site, client, vehicle_id, driver_id, start_date, end_date, budget, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const result = stmt.run(code, site, client, vehicle_id, driver_id, start_date, end_date, budget, req.user.id)

  db.prepare('UPDATE vehicles SET status = ? WHERE id = ?').run('affecte', vehicle_id)
  db.prepare('UPDATE drivers SET status = ? WHERE id = ?').run('en_mission', driver_id)

  logAudit(req.user.id, 'CREATE', 'missions', result.lastInsertRowid, { site, client, vehicle_id, driver_id })
  res.json({ id: result.lastInsertRowid, code, site, client, vehicle_id, driver_id, status: 'planifiee' })
})

// Record departure
app.post('/api/missions/:id/departure', requireRole(['conducteur']), (req, res) => {
  const { km, engine_hours, fuel_level } = req.body
  const missionId = parseInt(req.params.id)

  db.prepare('UPDATE missions SET status = ?, departure_km = ?, departure_time = ? WHERE id = ?').run('en_cours', km, new Date().toISOString(), missionId)
  db.prepare('UPDATE vehicles SET km = ?, engine_hours = ?, fuel_level = ? WHERE id = (SELECT vehicle_id FROM missions WHERE id = ?)').run(km, engine_hours, fuel_level, missionId)

  logAudit(req.user.id, 'UPDATE', 'missions', missionId, { departure_km: km })
  res.json({ ok: true })
})

// Record return
app.post('/api/missions/:id/arrival', requireRole(['conducteur']), (req, res) => {
  const { km, engine_hours, fuel_level, anomaly } = req.body
  const missionId = parseInt(req.params.id)

  db.prepare('UPDATE missions SET status = ?, arrival_km = ?, arrival_time = ? WHERE id = ?').run('retour', km, new Date().toISOString(), missionId)
  db.prepare('UPDATE vehicles SET status = ?, km = ?, engine_hours = ?, fuel_level = ? WHERE id = (SELECT vehicle_id FROM missions WHERE id = ?)').run('en_retour', km, engine_hours, fuel_level, missionId)

  const mission = db.prepare('SELECT code FROM missions WHERE id = ?').get(missionId)
  db.prepare('INSERT INTO alerts (mission_id, severity, title, detail) VALUES (?, ?, ?, ?)').run(missionId, 'urgent', `Return to verify - mission ${mission.code}`, 'A return needs verification.')

  logAudit(req.user.id, 'UPDATE', 'missions', missionId, { arrival_km: km, anomaly })
  res.json({ ok: true })
})

// Validate return
app.post('/api/missions/:id/validate', requireRole(['admin', 'gestionnaire']), (req, res) => {
  const missionId = parseInt(req.params.id)

  db.prepare('UPDATE missions SET status = ? WHERE id = ?').run('cloturee', missionId)
  db.prepare('UPDATE vehicles SET status = ? WHERE id = (SELECT vehicle_id FROM missions WHERE id = ?)').run('disponible', missionId)
  db.prepare('UPDATE drivers SET status = ? WHERE id = (SELECT driver_id FROM missions WHERE id = ?)').run('disponible', missionId)

  logAudit(req.user.id, 'UPDATE', 'missions', missionId, { status: 'cloturee' })
  res.json({ ok: true })
})

// ===== ALERTS ENDPOINTS =====
app.get('/api/alerts', (req, res) => {
  const alerts = db.prepare('SELECT * FROM alerts WHERE read = 0 ORDER BY created_at DESC').all()
  res.json(alerts)
})

app.post('/api/alerts/mark-read', (req, res) => {
  db.prepare('UPDATE alerts SET read = 1').run()
  res.json({ ok: true })
})

// ===== AUDIT ENDPOINTS =====
app.get('/api/audit', requireRole(['admin']), (req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all()
  res.json(logs)
})

app.listen(3000, () => console.log('Backend v2 running on http://localhost:3000 with SQLite'))
