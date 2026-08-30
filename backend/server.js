import express from 'express'
import cors from 'cors'
import { USERS, VEHICLES, DRIVERS, MISSIONS, FUEL_ENTRIES, EXPENSES, ALERTS } from './data.js'

const app = express()
app.use(cors())
app.use(express.json())

let state = {
  vehicles: JSON.parse(JSON.stringify(VEHICLES)),
  drivers: JSON.parse(JSON.stringify(DRIVERS)),
  missions: JSON.parse(JSON.stringify(MISSIONS)),
  fuelEntries: JSON.parse(JSON.stringify(FUEL_ENTRIES)),
  expenses: JSON.parse(JSON.stringify(EXPENSES)),
  alerts: JSON.parse(JSON.stringify(ALERTS)),
}

let seq = 100
function nextId(prefix) {
  seq += 1
  return `${prefix}${seq}`
}

function now() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  const user = USERS.find((u) => u.email.toLowerCase() === email?.toLowerCase() && u.password === password)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const { password: _pw, ...userData } = user
  res.json(userData)
})

app.get('/api/vehicles', (req, res) => res.json(state.vehicles))
app.get('/api/vehicles/:id', (req, res) => {
  const v = state.vehicles.find((x) => x.id === req.params.id)
  res.json(v || null)
})

app.get('/api/drivers', (req, res) => res.json(state.drivers))

app.get('/api/missions', (req, res) => res.json(state.missions))
app.get('/api/missions/:id', (req, res) => {
  const m = state.missions.find((x) => x.id === req.params.id)
  res.json(m || null)
})

app.post('/api/missions', (req, res) => {
  const { site, client, vehicleId, driverId, startDate, endDate, budget } = req.body
  const count = state.missions.length
  const mission = {
    id: nextId('m'),
    code: `MS-${String(84 + count - 4).padStart(4, '0')}`,
    site, client, vehicleId, driverId, startDate, endDate, budget,
    status: 'affectee',
    timeline: [
      { label: 'Mission created', time: now() },
      { label: 'Equipment assigned', time: now() },
    ],
  }
  state.missions.unshift(mission)
  state.vehicles = state.vehicles.map((v) =>
    v.id === vehicleId ? { ...v, status: 'affecte', site, driverId } : v
  )
  state.drivers = state.drivers.map((d) =>
    d.id === driverId ? { ...d, status: 'en_mission' } : d
  )
  res.json(mission)
})

app.post('/api/missions/:id/departure', (req, res) => {
  const { km, engineHours, fuelLevel, checklist } = req.body
  const mission = state.missions.find((m) => m.id === req.params.id)
  if (!mission) return res.status(404).json({ error: 'Mission not found' })
  mission.status = 'en_cours'
  mission.departure = { km, engineHours, fuelLevel, checklist, time: now() }
  mission.timeline.push({ label: 'Departure recorded', time: now() })
  const vehicle = state.vehicles.find((v) => v.id === mission.vehicleId)
  if (vehicle) {
    vehicle.status = 'en_mission'
    vehicle.km = km
    vehicle.engineHours = engineHours
    vehicle.fuelLevel = fuelLevel
  }
  res.json(mission)
})

app.post('/api/missions/:id/arrival', (req, res) => {
  const { km, engineHours, fuelLevel, checklist, anomaly } = req.body
  const mission = state.missions.find((m) => m.id === req.params.id)
  if (!mission) return res.status(404).json({ error: 'Mission not found' })
  mission.status = 'controle'
  mission.arrival = { km, engineHours, fuelLevel, checklist, anomaly, time: now() }
  mission.timeline.push({ label: 'Return recorded', time: now() })
  const vehicle = state.vehicles.find((v) => v.id === mission.vehicleId)
  if (vehicle) {
    vehicle.status = 'controle'
    vehicle.km = km
    vehicle.engineHours = engineHours
    vehicle.fuelLevel = fuelLevel
  }
  state.alerts.unshift({
    id: nextId('a'),
    severity: 'urgent',
    title: `Return to check - mission ${mission.code}`,
    detail: 'A return needs verification.',
    time: 'Just now',
    read: false,
  })
  res.json(mission)
})

app.post('/api/missions/:id/validate', (req, res) => {
  const mission = state.missions.find((m) => m.id === req.params.id)
  if (!mission) return res.status(404).json({ error: 'Mission not found' })
  mission.status = 'cloturee'
  mission.timeline.push({ label: 'Return validated - mission closed', time: now() })
  const vehicle = state.vehicles.find((v) => v.id === mission.vehicleId)
  if (vehicle) {
    vehicle.status = 'disponible'
    vehicle.site = undefined
    vehicle.driverId = undefined
  }
  const driver = state.drivers.find((d) => d.id === mission.driverId)
  if (driver) driver.status = 'disponible'
  res.json(mission)
})

app.post('/api/missions/:id/maintenance', (req, res) => {
  const mission = state.missions.find((m) => m.id === req.params.id)
  if (!mission) return res.status(404).json({ error: 'Mission not found' })
  mission.status = 'cloturee'
  mission.timeline.push({ label: 'Equipment sent to maintenance', time: now() })
  const vehicle = state.vehicles.find((v) => v.id === mission.vehicleId)
  if (vehicle) {
    vehicle.status = 'maintenance'
    vehicle.site = undefined
    vehicle.driverId = undefined
  }
  const driver = state.drivers.find((d) => d.id === mission.driverId)
  if (driver) driver.status = 'disponible'
  res.json(mission)
})

app.get('/api/fuel-entries', (req, res) => res.json(state.fuelEntries))
app.post('/api/fuel-entries', (req, res) => {
  const { vehicleId, missionId, liters, amount, station, km, date } = req.body
  const fuelEntry = { id: nextId('f'), vehicleId, missionId, liters, amount, station, km, date }
  state.fuelEntries.unshift(fuelEntry)
  const vehicle = state.vehicles.find((v) => v.id === vehicleId)
  const expense = {
    id: nextId('e'),
    vehicleId, missionId,
    category: 'Fuel',
    label: `Refueling ${vehicle?.code ?? ''}`,
    amount, date,
  }
  state.expenses.unshift(expense)
  res.json(fuelEntry)
})

app.get('/api/expenses', (req, res) => res.json(state.expenses))
app.post('/api/expenses', (req, res) => {
  const { vehicleId, missionId, category, label, amount, date } = req.body
  const expense = { id: nextId('e'), vehicleId, missionId, category, label, amount, date }
  state.expenses.unshift(expense)
  res.json(expense)
})

app.get('/api/alerts', (req, res) => res.json(state.alerts))
app.post('/api/alerts/mark-read', (req, res) => {
  state.alerts = state.alerts.map((a) => ({ ...a, read: true }))
  res.json({ ok: true })
})

app.listen(3000, () => console.log('Backend running on http://localhost:3000'))
