/**
 * API INTEGRATOR - Pont entre MissionOrchestrator (mock) et API Backend réelle
 * Permet de basculer entre mock et backend en 1 ligne
 */

import { missionOrchestrator } from './MissionOrchestrator'
import {
  Mission, Vehicle, DriverProfile, FuelEntry, Alert,
  UserRole, VehicleOwnership, VehicleStatus, MissionStatus, DriverStatus
} from '@/types'

interface ApiConfig {
  useBackend: boolean
  backendUrl: string
}

class ApiIntegrator {
  private config: ApiConfig = {
    useBackend: true,
    backendUrl: 'http://localhost:9090'
  }

  setConfig(config: Partial<ApiConfig>) {
    this.config = { ...this.config, ...config }
  }

  async createMission(data: {
    site: string
    client: string
    vehicleId: string
    driverId: string
    startDate: string
    endDate: string
  }, actorId: string, actorRole: UserRole): Promise<Mission> {
    if (this.config.useBackend) {
      const response = await fetch(`${this.config.backendUrl}/api/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return response.json()
    }

    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.createMission(data)
  }

  async assignMission(missionId: string, actorId: string, actorRole: UserRole): Promise<Mission> {
    if (this.config.useBackend) {
      const response = await fetch(`${this.config.backendUrl}/api/missions/${missionId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      return response.json()
    }

    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.assignMission(missionId)
  }

  async startMission(
    missionId: string,
    departureData: { km: number; engineHours: number; fuelLevel: number },
    actorId: string,
    actorRole: UserRole
  ): Promise<Mission> {
    if (this.config.useBackend) {
      const response = await fetch(`${this.config.backendUrl}/api/missions/${missionId}/departure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(departureData)
      })
      return response.json()
    }

    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.startMission(missionId, departureData)
  }

  async returnMission(
    missionId: string,
    arrivalData: { km: number; engineHours: number; fuelLevel: number },
    actorId: string,
    actorRole: UserRole
  ): Promise<Mission> {
    if (this.config.useBackend) {
      const response = await fetch(`${this.config.backendUrl}/api/missions/${missionId}/arrival`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arrivalData)
      })
      return response.json()
    }

    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.returnMission(missionId, arrivalData)
  }

  async validateReturn(
    missionId: string,
    isConform: boolean,
    actorId: string,
    actorRole: UserRole
  ): Promise<Mission> {
    if (this.config.useBackend) {
      const response = await fetch(`${this.config.backendUrl}/api/missions/${missionId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isConform })
      })
      return response.json()
    }

    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.validateReturn(missionId, isConform)
  }

  async recordFuel(
    missionId: string,
    fuelData: {
      quantity: number
      cost: number
      station: string
      receiptUrl: string
    },
    actorId: string,
    actorRole: UserRole
  ): Promise<FuelEntry> {
    if (this.config.useBackend) {
      const response = await fetch(`${this.config.backendUrl}/api/missions/${missionId}/fuel-entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fuelData)
      })
      return response.json()
    }

    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.recordFuel(missionId, fuelData)
  }

  async sendVehicleToMaintenance(
    vehicleId: string,
    reason: string,
    actorId: string,
    actorRole: UserRole
  ): Promise<Vehicle> {
    if (this.config.useBackend) {
      const response = await fetch(`${this.config.backendUrl}/api/vehicles/${vehicleId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      return response.json()
    }

    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.sendVehicleToMaintenance(vehicleId, reason)
  }

  async releaseVehicle(
    vehicleId: string,
    actorId: string,
    actorRole: UserRole
  ): Promise<Vehicle> {
    if (this.config.useBackend) {
      const response = await fetch(`${this.config.backendUrl}/api/vehicles/${vehicleId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      return response.json()
    }

    missionOrchestrator.setActor(actorId, actorRole)
    return missionOrchestrator.releaseVehicle(vehicleId)
  }
}

export const apiIntegrator = new ApiIntegrator()
