export const USERS = [
  { id: 'u1', name: 'Junior', email: 'admin@smartfleet.com', role: 'admin', password: 'admin123' },
  { id: 'u2', name: 'Manager', email: 'gestion@smartfleet.com', role: 'gestionnaire', password: 'gestion123' },
  { id: 'u3', name: 'Driver', email: 'conducteur@smartfleet.com', role: 'conducteur', password: 'conduct123', driverId: 'd1' },
]

export const VEHICLES = [
  { id: 'v1', code: 'P-001', type: 'Excavator', name: 'Hydraulic Excavator', plate: 'CI-8842-LT', status: 'affecte', km: 128450, engineHours: 4820, fuelLevel: 82, condition: 'Good', site: 'Site Alpha', driverId: 'd1' },
  { id: 'v2', code: 'B-002', type: 'Bulldozer', name: 'Bulldozer D6', plate: 'CI-5521-DL', status: 'disponible', km: 84210, engineHours: 3105, fuelLevel: 64, condition: 'Good' },
  { id: 'v3', code: 'N-003', type: 'Grader', name: 'Grader 140K', plate: 'CI-7710-YA', status: 'maintenance', km: 152980, engineHours: 6240, fuelLevel: 18, condition: 'Fair' },
  { id: 'v4', code: 'P-004', type: 'Excavator', name: 'Wheeled Excavator', plate: 'CI-3308-DA', status: 'en_mission', km: 96540, engineHours: 3890, fuelLevel: 45, condition: 'Good', site: 'Site Beta', driverId: 'd2' },
  { id: 'v5', code: 'C-005', type: 'Truck', name: 'Dump Truck', plate: 'CI-1194-LT', status: 'en_retour', km: 210330, engineHours: 7150, fuelLevel: 28, condition: 'Good', site: 'Site Gamma', driverId: 'd3' },
  { id: 'v6', code: 'C-006', type: 'Truck', name: 'Water Truck', plate: 'CI-6620-CE', status: 'disponible', km: 176800, engineHours: 5980, fuelLevel: 91, condition: 'Good' },
  { id: 'v7', code: 'G-007', type: 'Crane', name: 'Mobile Crane', plate: 'CI-0042-LT', status: 'controle', km: 64200, engineHours: 2210, fuelLevel: 37, condition: 'Fair', site: 'Site Alpha' },
  { id: 'v8', code: 'EX-008', type: 'Compactor', name: 'Compactor Rental', plate: 'CI-9915-DA', status: 'en_mission', km: 41200, engineHours: 1540, fuelLevel: 58, condition: 'Good', site: 'Site Beta', driverId: 'd4', external: { provider: 'Company XYZ', start: '2026-08-01', end: '2026-08-31', dailyRate: 75000 } },
  { id: 'v9', code: 'P-009', type: 'Mini Excavator', name: 'Mini Excavator', plate: 'CI-2277-YA', status: 'panne', km: 58900, engineHours: 2050, fuelLevel: 12, condition: 'Poor' },
  { id: 'v10', code: 'B-010', type: 'Bulldozer', name: 'Bulldozer D8', plate: 'CI-4471-CE', status: 'disponible', km: 112480, engineHours: 4420, fuelLevel: 76, condition: 'Good' },
]

export const DRIVERS = [
  { id: 'd1', name: 'Driver 1', matricule: 'GS-OP-001', phone: '+225 07 690 11 22 33', license: 'CE', skills: ['Excavator', 'Bulldozer'], status: 'en_mission' },
  { id: 'd2', name: 'Driver 2', matricule: 'GS-OP-002', phone: '+225 07 677 44 55 66', license: 'CE', skills: ['Excavator', 'Truck'], status: 'en_mission' },
  { id: 'd3', name: 'Driver 3', matricule: 'GS-OP-003', phone: '+225 07 655 77 88 99', license: 'C', skills: ['Grader', 'Truck'], status: 'en_mission' },
  { id: 'd4', name: 'Driver 4', matricule: 'GS-OP-004', phone: '+225 07 699 00 11 22', license: 'CE', skills: ['Compactor', 'Bulldozer'], status: 'en_mission' },
  { id: 'd5', name: 'Driver 5', matricule: 'GS-OP-005', phone: '+225 07 676 33 44 55', license: 'CE', skills: ['Crane', 'Truck'], status: 'disponible' },
  { id: 'd6', name: 'Driver 6', matricule: 'GS-OP-006', phone: '+225 07 691 66 77 88', license: 'C', skills: ['Excavator'], status: 'disponible' },
]

export const MISSIONS = [
  { id: 'm1', code: 'MS-0084', site: 'Site Alpha', client: 'Client A', vehicleId: 'v1', driverId: 'd1', startDate: '2026-08-27', endDate: '2026-08-30', budget: 1500000, status: 'affectee', timeline: [{ label: 'Mission created', time: '26/08 17:12' }, { label: 'Equipment assigned', time: '26/08 17:15' }] },
  { id: 'm2', code: 'MS-0083', site: 'Site Beta', client: 'Client B', vehicleId: 'v4', driverId: 'd2', startDate: '2026-08-25', endDate: '2026-08-29', budget: 2200000, status: 'en_cours', departure: { km: 96380, engineHours: 3874, fuelLevel: 88, checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true }, time: '25/08 07:58' }, timeline: [{ label: 'Mission created', time: '24/08 16:40' }, { label: 'Equipment assigned', time: '24/08 16:42' }, { label: 'Departure recorded', time: '25/08 07:58' }] },
  { id: 'm3', code: 'MS-0082', site: 'Site Gamma', client: 'Client A', vehicleId: 'v5', driverId: 'd3', startDate: '2026-08-24', endDate: '2026-08-27', budget: 980000, status: 'retour', departure: { km: 210120, engineHours: 7143, fuelLevel: 79, checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true }, time: '24/08 08:05' }, arrival: { km: 210330, engineHours: 7150, fuelLevel: 28, checklist: { pneus: true, freins: true, eclairage: true, carrosserie: false }, anomaly: 'Scratch on right door', time: '27/08 09:40' }, timeline: [{ label: 'Mission created', time: '23/08 15:10' }, { label: 'Equipment assigned', time: '23/08 15:14' }, { label: 'Departure recorded', time: '24/08 08:05' }, { label: 'Return recorded', time: '27/08 09:40' }] },
  { id: 'm4', code: 'MS-0081', site: 'Site Beta', client: 'Client B', vehicleId: 'v8', driverId: 'd4', startDate: '2026-08-20', endDate: '2026-08-31', budget: 3100000, status: 'en_cours', departure: { km: 40950, engineHours: 1521, fuelLevel: 95, checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true }, time: '20/08 08:12' }, timeline: [{ label: 'Mission created', time: '19/08 11:30' }, { label: 'Equipment assigned', time: '19/08 11:35' }, { label: 'Departure recorded', time: '20/08 08:12' }] },
  { id: 'm5', code: 'MS-0080', site: 'Site Alpha', client: 'Client A', vehicleId: 'v7', driverId: 'd5', startDate: '2026-08-18', endDate: '2026-08-26', budget: 1750000, status: 'controle', departure: { km: 63980, engineHours: 2196, fuelLevel: 90, checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true }, time: '18/08 07:45' }, arrival: { km: 64200, engineHours: 2210, fuelLevel: 37, checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true }, time: '26/08 17:20' }, timeline: [{ label: 'Mission created', time: '17/08 10:05' }, { label: 'Equipment assigned', time: '17/08 10:08' }, { label: 'Departure recorded', time: '18/08 07:45' }, { label: 'Return recorded', time: '26/08 17:20' }] },
]

export const FUEL_ENTRIES = [
  { id: 'f1', vehicleId: 'v1', missionId: 'm1', liters: 120, amount: 85000, station: 'Station A', km: 128450, date: '2026-08-26' },
  { id: 'f2', vehicleId: 'v4', missionId: 'm2', liters: 180, amount: 126000, station: 'Station B', km: 96500, date: '2026-08-25' },
  { id: 'f3', vehicleId: 'v5', missionId: 'm3', liters: 90, amount: 63000, station: 'Station C', km: 210200, date: '2026-08-24' },
  { id: 'f4', vehicleId: 'v8', missionId: 'm4', liters: 150, amount: 105000, station: 'Station D', km: 41050, date: '2026-08-22' },
  { id: 'f5', vehicleId: 'v7', missionId: 'm5', liters: 110, amount: 77000, station: 'Station E', km: 64050, date: '2026-08-20' },
  { id: 'f6', vehicleId: 'v6', liters: 200, amount: 140000, station: 'Station A', km: 176800, date: '2026-08-19' },
]

export const EXPENSES = [
  { id: 'e1', vehicleId: 'v1', missionId: 'm1', category: 'Fuel', label: 'Refueling P-001', amount: 85000, date: '2026-08-26' },
  { id: 'e2', vehicleId: 'v3', category: 'Maintenance', label: 'Hydraulic service', amount: 450000, date: '2026-08-25' },
  { id: 'e3', vehicleId: 'v5', missionId: 'm3', category: 'Tolls', label: 'Route tolls', amount: 42000, date: '2026-08-24' },
  { id: 'e4', vehicleId: 'v9', category: 'Parts', label: 'Fuel pump', amount: 380000, date: '2026-08-23' },
  { id: 'e5', vehicleId: 'v4', missionId: 'm2', category: 'Fuel', label: 'Refueling P-004', amount: 126000, date: '2026-08-25' },
  { id: 'e6', vehicleId: 'v8', missionId: 'm4', category: 'Rental', label: 'Rental equipment EX-008', amount: 525000, date: '2026-08-20' },
  { id: 'e7', category: 'Other', label: 'Fleet insurance', amount: 200000, date: '2026-08-15' },
]

export const ALERTS = [
  { id: 'a1', severity: 'urgent', title: 'C-005 Return not checked', detail: 'Return for mission MS-0082 awaits verification.', time: '15 min ago', read: false },
  { id: 'a2', severity: 'urgent', title: 'P-009 Equipment down', detail: 'Fuel pump failure, immobilized.', time: '2 hours ago', read: false },
  { id: 'a3', severity: 'attention', title: 'Contract EX-008 expiring', detail: 'Rental ends 31/08.', time: '3 hours ago', read: false },
  { id: 'a4', severity: 'attention', title: 'N-003 Maintenance underway', detail: 'Hydraulic service until 29/08.', time: 'Yesterday', read: false },
  { id: 'a5', severity: 'info', title: 'Mission MS-0080 in check', detail: 'Crane G-007 return to validate.', time: 'Yesterday', read: false },
]
