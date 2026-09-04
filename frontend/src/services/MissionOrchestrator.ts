/**
 * MISSION ORCHESTRATOR - Service métier centralisé
 * Coordonne les transitions d'état Mission + Vehicle + Driver
 * en s'appuyant sur le store Zustand (source de vérité unique),
 * avec contrôle RBAC via PermissionService.
 */

import { useFleetStore } from '@/store/fleetStore'
import { useAuditStore } from '@/store/auditStore'
import type { Mission, Vehicle, Driver, FuelEntry, CounterReading, UserRole } from '@/types'
import { permissionService } from './PermissionService'

interface MissionInput {
  site: string
  client?: string
  vehicleId: string
  driverId: string
  startDate: string
  endDate: string
  budget: number
}

class MissionOrchestrator {
  private currentActorId = ''
  private currentActorRole: UserRole = 'admin'

  setActor(actorId: string, actorRole: UserRole) {
    this.currentActorId = actorId
    this.currentActorRole = actorRole
  }

  getActor() {
    return { id: this.currentActorId, role: this.currentActorRole }
  }

  private requirePermission(permission: string) {
    if (!permissionService.hasPermission(this.currentActorRole, permission)) {
      throw new Error(`Action non autorisée pour le rôle ${this.currentActorRole} (${permission})`)
    }
  }

  /** PHASE 1-2 : Création + affectation de mission */
  async createMission(data: MissionInput): Promise<Mission> {
    this.requirePermission('mission.create')
    const state = useFleetStore.getState()

    const vehicle = state.vehicles.find((v) => v.id === data.vehicleId)
    if (!vehicle) throw new Error('Engin non trouvé')
    if (vehicle.status !== 'disponible' && vehicle.status !== 'reserve') {
      throw new Error(`Engin ${vehicle.code} non disponible (${vehicle.status})`)
    }

    const driver = state.drivers.find((d) => d.id === data.driverId)
    if (!driver) throw new Error('Conducteur non trouvé')
    if (driver.status !== 'disponible' && driver.status !== 'reserve') {
      throw new Error(`Conducteur non disponible (${driver.status})`)
    }

    if (!driver.skills.includes(vehicle.type)) {
      throw new Error(`Conducteur non habilité pour engins type ${vehicle.type}`)
    }

    const overlapVehicle = state.missions.some((m) => {
      if (m.status === 'cloturee') return false
      if (m.vehicleId !== data.vehicleId) return false
      return !(data.endDate < m.startDate || data.startDate > m.endDate)
    })
    if (overlapVehicle) {
      throw new Error(`Engin déjà réservé sur cette période`)
    }

    const overlapDriver = state.missions.some((m) => {
      if (m.status === 'cloturee') return false
      if (m.driverId !== data.driverId) return false
      return !(data.endDate < m.startDate || data.startDate > m.endDate)
    })
    if (overlapDriver) {
      throw new Error(`Conducteur déjà affecté sur cette période`)
    }

    const mission = await state.createMission(data)
    if (!mission) {
      // Le magasin a conservé le message du serveur : le remonter tel quel
      // plutôt qu'un libellé générique, il nomme le conflit.
      throw new Error(useFleetStore.getState().error ?? "La mission n'a pas pu être créée")
    }
    useAuditStore.getState().log({
      actor: this.currentActorId,
      action: 'mission.created',
      missionId: mission.id,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      details: { site: data.site, budget: data.budget },
    })
    return mission
  }

  /** PHASE 3 : Départ (mission → en_cours, engin → en_mission) */
  async startMission(missionId: string, departure: Omit<CounterReading, 'time'>): Promise<Mission> {
    this.requirePermission('mission.start')
    const state = useFleetStore.getState()
    const mission = state.missions.find((m) => m.id === missionId)
    if (!mission) throw new Error('Mission non trouvée')
    if (mission.status !== 'affectee') throw new Error('Mission non affectée')

    await state.recordDeparture(missionId, departure)
    useAuditStore.getState().log({
      actor: this.currentActorId,
      action: 'mission.started',
      missionId,
      vehicleId: mission.vehicleId,
      driverId: mission.driverId,
      details: { km: departure.km, fuelLevel: departure.fuelLevel },
    })
    const updated = useFleetStore.getState().missions.find((m) => m.id === missionId)
    if (!updated) {
      throw new Error(useFleetStore.getState().error ?? 'Mission introuvable après mise à jour')
    }
    return updated
  }

  /** PHASE 4 : Retour (mission → controle, engin → controle) */
  async returnMission(missionId: string, arrival: Omit<CounterReading, 'time'>): Promise<Mission> {
    this.requirePermission('mission.return')
    const state = useFleetStore.getState()
    const mission = state.missions.find((m) => m.id === missionId)
    if (!mission) throw new Error('Mission non trouvée')
    if (mission.status !== 'en_cours') throw new Error('Mission non en cours')

    await state.recordReturn(missionId, arrival)
    useAuditStore.getState().log({
      actor: this.currentActorId,
      action: 'mission.returned',
      missionId,
      vehicleId: mission.vehicleId,
      driverId: mission.driverId,
      details: { km: arrival.km, fuelLevel: arrival.fuelLevel },
    })
    const updated = useFleetStore.getState().missions.find((m) => m.id === missionId)
    if (!updated) {
      throw new Error(useFleetStore.getState().error ?? 'Mission introuvable après mise à jour')
    }
    return updated
  }

  /** PHASE 5 : Validation du retour (→ cloturee, engin → disponible ou maintenance) */
  async validateReturn(missionId: string, isConform = true): Promise<Mission> {
    this.requirePermission('mission.validate')
    const state = useFleetStore.getState()
    const mission = state.missions.find((m) => m.id === missionId)
    if (!mission) throw new Error('Mission non trouvée')
    if (mission.status !== 'controle') {
      throw new Error('Mission non en contrôle')
    }

    if (isConform) await state.validateReturn(missionId)
    else await state.sendToMaintenance(missionId)
    useAuditStore.getState().log({
      actor: this.currentActorId,
      action: isConform ? 'mission.validated' : 'mission.maintenance',
      missionId,
      vehicleId: mission.vehicleId,
      driverId: mission.driverId,
      details: { conform: isConform },
    })
    const updated = useFleetStore.getState().missions.find((m) => m.id === missionId)
    if (!updated) {
      throw new Error(useFleetStore.getState().error ?? 'Mission introuvable après mise à jour')
    }
    return updated
  }

  /** Carburant */
  async recordFuel(entry: Omit<FuelEntry, 'id'>): Promise<void> {
    this.requirePermission('fuel.create')
    await useFleetStore.getState().addFuelEntry(entry)
  }

  /** Requêtes */
  getEligibleVehicles(): Vehicle[] {
    return useFleetStore.getState().vehicles.filter((v) => v.status === 'disponible')
  }

  getEligibleDrivers(): Driver[] {
    return useFleetStore.getState().drivers.filter((d) => d.status === 'disponible')
  }

  getDriverMissions(driverId: string): Mission[] {
    return useFleetStore.getState().missions.filter((m) => m.driverId === driverId)
  }

  getMissionFuelEntries(missionId: string): FuelEntry[] {
    return useFleetStore.getState().fuelEntries.filter((f) => f.missionId === missionId)
  }
}

export const missionOrchestrator = new MissionOrchestrator()
