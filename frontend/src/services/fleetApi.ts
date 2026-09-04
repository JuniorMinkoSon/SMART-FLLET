import { api } from './apiClient'
import type { UserRole } from '@/types'

/* ------------------------------------------------------------------ */
/*  Contrats renvoyés par le backend Spring (source de vérité).        */
/*  Les enums sont en MAJUSCULES côté API, minuscules côté UI.         */
/* ------------------------------------------------------------------ */

export interface ApiAuth {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'GESTIONNAIRE' | 'CONDUCTEUR'
  token: string | null
}

export interface ApiVehicle {
  id: string
  code: string
  type: string
  licensePlate: string
  status: 'DISPONIBLE' | 'RESERVE' | 'EN_MISSION' | 'CONTROLE' | 'MAINTENANCE' | 'HORS_SERVICE'
  initialKm: number
  currentKm: number
  engineHours: number
  fuelLevel: number
}

export interface ApiDriver {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: 'DISPONIBLE' | 'RESERVE' | 'EN_MISSION' | 'INDISPONIBLE'
  skills?: string | null
  licenseType?: string | null
}

export interface ApiMission {
  id: string
  code: string
  site: string
  client: string | null
  startDate: string
  endDate: string
  budget: number
  status: 'AFFECTEE' | 'EN_COURS' | 'CONTROLE' | 'CLOTUREE'
  vehicleId: string | null
  vehicleCode: string | null
  vehicleType: string | null
  vehiclePlate: string | null
  driverId: string | null
  driverName: string | null
  driverPhone: string | null
  departureKm: number | null
  departureEngineHours: number | null
  departureFuel: number | null
  arrivalKm: number | null
  arrivalEngineHours: number | null
  arrivalFuel: number | null
}

export interface ApiUser {
  id: string
  email: string
  name: string
  role: ApiAuth['role']
  enabled: boolean
}

/* ------------------------------------------------------------------ */
/*  Normalisation API -> UI                                            */
/* ------------------------------------------------------------------ */

export function roleToUi(role: string): UserRole {
  return role.toLowerCase() as UserRole
}

/** `EN_MISSION` -> `en_mission` : les classes CSS et libellés sont en minuscules. */
export function statusToUi(status: string): string {
  return status.toLowerCase()
}

/** Les compétences du conducteur sont stockées en JSON texte côté backend. */
export function parseSkills(raw?: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

/* ------------------------------------------------------------------ */
/*  Endpoints                                                          */
/* ------------------------------------------------------------------ */

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiAuth>('/auth/login', { email, password }, { skipAuthRedirect: true }),
  register: (name: string, email: string, password: string) =>
    api.post<ApiAuth>('/auth/register', { name, email, password }, { skipAuthRedirect: true }),
  me: () => api.get<ApiAuth>('/auth/me'),
  logout: () => api.post<void>('/auth/logout'),
}

export const vehiclesApi = {
  list: () => api.get<ApiVehicle[]>('/vehicles'),
  get: (id: string) => api.get<ApiVehicle>(`/vehicles/${id}`),
  available: () => api.get<ApiVehicle[]>('/vehicles/available'),
  create: (body: {
    code: string
    type: string
    licensePlate: string
    initialKm?: number
    fuelLevel?: number
  }) => api.post<ApiVehicle>('/vehicles', body),
}

export const driversApi = {
  list: () => api.get<ApiDriver[]>('/drivers'),
  available: () => api.get<ApiDriver[]>('/drivers/available'),
}

export const missionsApi = {
  list: () => api.get<ApiMission[]>('/missions'),
  mine: () => api.get<ApiMission[]>('/missions/me'),
  get: (id: string) => api.get<ApiMission>(`/missions/${id}`),
  /** Peut lever une ApiError 409 portant `conflicts` et `alternatives`. */
  create: (body: {
    vehicleId: string
    driverId: string
    startDate: string
    endDate: string
    site: string
    client?: string
    budget: number
  }) => api.post<ApiMission>('/missions', body),
  start: (id: string, body: { km: number; engineHours: number; fuel: number }) =>
    api.post<ApiMission>(`/missions/${id}/start`, body),
  return: (id: string, body: { km: number; engineHours: number; fuel: number }) =>
    api.post<ApiMission>(`/missions/${id}/return`, body),
  validate: (id: string, isConform: boolean) =>
    api.post<ApiMission>(`/missions/${id}/validate`, { isConform }),
  assignDriver: (id: string, driverId: string) =>
    api.post<ApiMission>(`/missions/${id}/assign-driver/${driverId}`),
}

export const usersApi = {
  list: () => api.get<ApiUser[]>('/users'),
  create: (body: { email: string; password: string; name: string; role: string }) =>
    api.post<ApiUser>('/users', body),
  remove: (id: string) => api.del<void>(`/users/${id}`),
}
