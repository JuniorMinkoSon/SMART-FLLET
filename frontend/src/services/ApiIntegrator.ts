/**
 * API INTEGRATOR - Pont entre MissionOrchestrator (mock) et API backend réelle.
 * Permet de basculer entre mock local et backend en 1 ligne (setConfig).
 */

import { missionOrchestrator } from './MissionOrchestrator'
import type { Mission, FuelEntry, CounterReading, UserRole } from '@/types'

interface ApiConfig {
  useBackend: boolean
  backendUrl: string
}

class ApiIntegrator {
  private config: ApiConfig = {
    useBackend: import.meta.env.VITE_USE_BACKEND === 'true',
    backendUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  }

  setConfig(config: Partial<ApiConfig>) {
    this.config = { ...this.config, ...config }
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
        fuel: departure.fuel,
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
        fuel: arrival.fuel,
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
        quantity: entry.quantity,
        cost: entry.cost,
        station: entry.station,
      })
      return
    }
    missionOrchestrator.setActor(actorId, actorRole)
    missionOrchestrator.recordFuel(entry)
  }
}

export const apiIntegrator = new ApiIntegrator()
