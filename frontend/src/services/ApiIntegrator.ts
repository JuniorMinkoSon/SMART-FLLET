/**
 * API INTEGRATOR - Pont entre MissionOrchestrator (mock) et API backend réelle.
 * Permet de basculer entre mock local et backend en 1 ligne (setConfig).
 */

import { missionOrchestrator } from './MissionOrchestrator'
import type { Mission, FuelEntry, CounterReading, UserRole, Vehicle, Driver } from '@/types'

interface ApiConfig {
  useBackend: boolean
  backendUrl: string
}

class ApiIntegrator {
  private config: ApiConfig = {
    useBackend: import.meta.env?.VITE_USE_BACKEND === 'true',
    backendUrl: import.meta.env?.VITE_API_URL || 'http://localhost:9090',
  }

  private normalizeStatusToFrontend(status: string): string {
    return status.toLowerCase()
  }

  setConfig(config: Partial<ApiConfig>) {
    this.config = { ...this.config, ...config }
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.config.backendUrl}/api${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error(`API ${path}: ${response.status}`)
    return response.json() as Promise<T>
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.config.backendUrl}/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`API ${path}: ${response.status}`)
    return response.json() as Promise<T>
  }

  async getVehicles(): Promise<Vehicle[]> {
    try {
      if (this.config.useBackend) {
        const vehicles = await this.get<Vehicle[]>('/vehicles')
        return vehicles.map(v => ({ ...v, status: this.normalizeStatusToFrontend(v.status) } as Vehicle))
      }
    } catch (err) {
      // Fallback to mock
    }
    return []
  }

  async getDrivers(): Promise<Driver[]> {
    try {
      if (this.config.useBackend) {
        const drivers = await this.get<Driver[]>('/drivers')
        return drivers.map(d => ({ ...d, status: this.normalizeStatusToFrontend(d.status) } as Driver))
      }
    } catch (err) {
      // Fallback to mock
    }
    return []
  }

  async getMissions(): Promise<Mission[]> {
    try {
      if (this.config.useBackend) {
        const missions = await this.get<Mission[]>('/missions')
        return missions.map(m => ({ ...m, status: this.normalizeStatusToFrontend(m.status) } as Mission))
      }
    } catch (err) {
      // Fallback to mock
    }
    return []
  }

  async createMission(
    data: {
      site: string
      client?: string
      vehicleId: string
      driverId: string
      startDate: string
      endDate: string
      budget: number
    },
    actorId: string,
    actorRole: UserRole,
  ): Promise<Mission> {
    if (this.config.useBackend) {
      return this.post<Mission>('/missions', data)
    }
    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.createMission(data)
  }

  async startMission(
    missionId: string,
    departure: Omit<CounterReading, 'time'>,
    actorId: string,
    actorRole: UserRole,
  ): Promise<Mission> {
    if (this.config.useBackend) {
      return this.post<Mission>(`/missions/${missionId}/start`, {
        km: departure.km,
        engineHours: departure.engineHours,
        fuel: departure.fuelLevel,
      })
    }
    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.startMission(missionId, departure)
  }

  async returnMission(
    missionId: string,
    arrival: Omit<CounterReading, 'time'>,
    actorId: string,
    actorRole: UserRole,
  ): Promise<Mission> {
    if (this.config.useBackend) {
      return this.post<Mission>(`/missions/${missionId}/return`, {
        km: arrival.km,
        engineHours: arrival.engineHours,
        fuel: arrival.fuelLevel,
      })
    }
    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.returnMission(missionId, arrival)
  }

  async validateReturn(
    missionId: string,
    isConform: boolean,
    actorId: string,
    actorRole: UserRole,
  ): Promise<Mission> {
    if (this.config.useBackend) {
      return this.post<Mission>(`/missions/${missionId}/validate`, { isConform })
    }
    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.validateReturn(missionId, isConform)
  }

  async recordFuel(
    entry: Omit<FuelEntry, 'id'>,
    actorId: string,
    actorRole: UserRole,
  ): Promise<void> {
    if (this.config.useBackend) {
      await this.post(`/missions/${entry.missionId}/fuel`, {
        quantity: entry.liters,
        cost: entry.amount,
        station: entry.station,
      })
      return
    }
    missionOrchestrator.setActor(actorId, actorRole)
    missionOrchestrator.recordFuel(entry)
  }
}

export const apiIntegrator = new ApiIntegrator()
