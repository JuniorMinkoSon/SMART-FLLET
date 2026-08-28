import { useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useFleetStore } from '@/store/fleetStore'
import { missionOrchestrator } from '@/services/MissionOrchestrator'
import { permissionService } from '@/services/PermissionService'
import type { CounterReading, FuelEntry } from '@/types'

/**
 * useMissionWorkflow - Façade pour orchestrer les workflows métier
 * Vérifie les permissions et appelle MissionOrchestrator + FleetStore
 */
export function useMissionWorkflow() {
  const { user } = useAuthStore()
  const fleetStore = useFleetStore()

  const ensurePermission = useCallback(
    (perm: string) => {
      if (!user) throw new Error('User not authenticated')
      if (!permissionService.hasPermission(user.role, perm)) {
        throw new Error(`Permission denied: ${perm}`)
      }
    },
    [user]
  )

  const ensureActor = useCallback(() => {
    if (!user) throw new Error('User not authenticated')
    missionOrchestrator.setActor(user.id, user.role)
  }, [user])

  // ========== MISSIONS ==========

  const createMission = useCallback(
    (data: {
      site: string
      client?: string
      vehicleId: string
      driverId: string
      startDate: string
      endDate: string
      budget: number
    }) => {
      ensurePermission('mission.create')
      ensureActor()
      return fleetStore.createMission(data)
    },
    [ensurePermission, ensureActor, fleetStore]
  )

  const startMission = useCallback(
    (missionId: string, departure: Omit<CounterReading, 'time'>) => {
      ensurePermission('mission.start')
      ensureActor()
      fleetStore.recordDeparture(missionId, departure)
      return fleetStore.missions.find((m) => m.id === missionId)!
    },
    [ensurePermission, ensureActor, fleetStore]
  )

  const returnMission = useCallback(
    (missionId: string, arrival: Omit<CounterReading, 'time'>) => {
      ensurePermission('mission.return')
      ensureActor()
      fleetStore.recordReturn(missionId, arrival)
      return fleetStore.missions.find((m) => m.id === missionId)!
    },
    [ensurePermission, ensureActor, fleetStore]
  )

  const validateReturn = useCallback(
    (missionId: string, isConform: boolean = true) => {
      ensurePermission('mission.validate')
      ensureActor()
      if (isConform) {
        fleetStore.validateReturn(missionId)
      } else {
        fleetStore.sendToMaintenance(missionId)
      }
      return fleetStore.missions.find((m) => m.id === missionId)!
    },
    [ensurePermission, ensureActor, fleetStore]
  )

  // ========== FUEL ==========

  const recordFuel = useCallback(
    (entry: Omit<FuelEntry, 'id'>) => {
      ensurePermission('fuel.create')
      ensureActor()
      fleetStore.addFuelEntry(entry)
    },
    [ensurePermission, ensureActor, fleetStore]
  )

  // ========== QUERIES ==========

  const getEligibleVehicles = useCallback(() => {
    return fleetStore.vehicles.filter((v) => v.status === 'disponible')
  }, [fleetStore])

  const getEligibleDrivers = useCallback(() => {
    return fleetStore.drivers.filter((d) => d.status === 'disponible')
  }, [fleetStore])

  const getDriverMissions = useCallback(
    (driverId: string) => {
      return fleetStore.missions.filter((m) => m.driverId === driverId)
    },
    [fleetStore]
  )

  const getUserMissions = useCallback(() => {
    if (!user || user.role !== 'conducteur') return []
    const driverId = user.driverId
    if (!driverId) return []
    return fleetStore.missions.filter((m) => m.driverId === driverId)
  }, [user, fleetStore])

  const canPerform = useCallback(
    (action: string) => {
      if (!user) return false
      return permissionService.hasPermission(user.role, action)
    },
    [user]
  )

  return {
    // Actions
    createMission,
    startMission,
    returnMission,
    validateReturn,
    recordFuel,

    // Queries
    getEligibleVehicles,
    getEligibleDrivers,
    getDriverMissions,
    getUserMissions,
    canPerform,

    // Store data
    missions: fleetStore.missions,
    vehicles: fleetStore.vehicles,
    drivers: fleetStore.drivers,
    fuelEntries: fleetStore.fuelEntries,
    alerts: fleetStore.alerts,
  }
}
