export type UserRole = 'admin' | 'gestionnaire' | 'conducteur'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  driverId?: string
}

export type VehicleStatus =
  | 'disponible'
  | 'reserve'
  | 'en_mission'
  | 'controle'
  | 'maintenance'
  | 'hors_service'

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  disponible: 'Disponible',
  reserve: 'Réservé',
  en_mission: 'En mission',
  controle: 'Contrôle',
  maintenance: 'Maintenance',
  hors_service: 'Hors service',
}

export interface ExternalContract {
  provider: string
  start: string
  end: string
  dailyRate: number
}

export interface Vehicle {
  id: string
  code: string
  type: string
  name: string
  plate: string
  status: VehicleStatus
  km: number
  engineHours: number
  fuelLevel: number
  condition: 'Bon' | 'Moyen' | 'Mauvais'
  site?: string
  driverId?: string
  external?: ExternalContract
}

export type MissionStatus =
  | 'planifiee'
  | 'affectee'
  | 'en_cours'
  | 'retour'
  | 'controle'
  | 'cloturee'

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  planifiee: 'Planifiée',
  affectee: 'Affectée',
  en_cours: 'En cours',
  retour: 'Retour',
  controle: 'Contrôle',
  cloturee: 'Clôturée',
}

export interface ChecklistState {
  pneus: boolean
  freins: boolean
  eclairage: boolean
  carrosserie: boolean
}

export interface CounterReading {
  km: number
  engineHours: number
  fuelLevel: number
  checklist: ChecklistState
  anomaly?: string
  time: string
}

export interface TimelineEvent {
  label: string
  time: string
}

export interface Mission {
  id: string
  code: string
  site: string
  client?: string
  vehicleId: string
  driverId: string
  startDate: string
  endDate: string
  budget: number
  status: MissionStatus
  departure?: CounterReading
  arrival?: CounterReading
  timeline: TimelineEvent[]
}

export interface Driver {
  id: string
  name: string
  matricule: string
  phone: string
  license: string
  skills: string[]
  status: 'disponible' | 'reserve' | 'en_mission' | 'indisponible'
}

export interface FuelEntry {
  id: string
  vehicleId: string
  missionId?: string
  liters: number
  amount: number
  station?: string
  km?: number
  date: string
}

export type ExpenseCategory =
  | 'Carburant'
  | 'Maintenance'
  | 'Péages'
  | 'Pièces'
  | 'Location'
  | 'Autres'

export interface Expense {
  id: string
  vehicleId?: string
  missionId?: string
  category: ExpenseCategory
  label: string
  amount: number
  date: string
}

export type AlertSeverity = 'urgent' | 'attention' | 'info'

export interface FleetAlert {
  id: string
  severity: AlertSeverity
  title: string
  detail: string
  time: string
  read: boolean
}
