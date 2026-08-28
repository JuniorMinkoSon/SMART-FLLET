/**
 * MISSION ORCHESTRATOR - Service métier centralisé
 * Gère TOUTES les transitions d'état de manière transactionnelle
 * Coordonne: Mission + Vehicle + Driver + Audit
 */

import { useFleetStore } from '@/store/fleetStore'
import {
  Mission, Vehicle, DriverProfile, FuelEntry, Alert, AuditLog,
  MissionStatus, VehicleStatus, DriverStatus, AlertType, AuditAction, UserRole
} from '@/types'

class MissionOrchestrator {
  private fleetStore = useFleetStore()
  private currentActorId: string = ''
  private currentActorRole: UserRole = UserRole.ADMIN

  setActor(actorId: string, actorRole: UserRole) {
    this.currentActorId = actorId
    this.currentActorRole = actorRole
  }

  /**
   * ===============================================
   * PHASE 1: CRÉATION DE MISSION
   * ===============================================
   */
  createMission(data: {
    site: string
    client: string
    vehicleId: string
    driverId: string
    startDate: string
    endDate: string
  }): Mission {
    const vehicle = this.fleetStore.getVehicleById(data.vehicleId)
    if (!vehicle) throw new Error('Véhicule non trouvé')
    if (vehicle.status !== VehicleStatus.DISPONIBLE) {
      throw new Error(`Véhicule ${vehicle.code} non disponible`)
    }

    const driver = this.fleetStore.getDriverById(data.driverId)
    if (!driver) throw new Error('Conducteur non trouvé')
    if (driver.status !== DriverStatus.DISPONIBLE) {
      throw new Error('Conducteur non disponible')
    }

    const mission: Mission = {
      id: `MS-${Date.now()}`,
      site: data.site,
      client: data.client,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      status: MissionStatus.PLANIFIEE,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: new Date().toISOString()
    }

    this.fleetStore.setMissions([...this.fleetStore.missions, mission])
    this.logAudit(AuditAction.CREATE_MISSION, `Mission ${mission.id} créée`)

    return mission
  }

  /**
   * ===============================================
   * PHASE 2: AFFECTATION DE MISSION
   * ===============================================
   */
  assignMission(missionId: string): Mission {
    const mission = this.fleetStore.getMissionById(missionId)
    if (!mission) throw new Error('Mission non trouvée')
    if (mission.status !== MissionStatus.PLANIFIEE) {
      throw new Error('Mission non en état PLANIFIEE')
    }

    const vehicle = this.fleetStore.getVehicleById(mission.vehicleId)
    const driver = this.fleetStore.getDriverById(mission.driverId)

    // Transition états: Mission → AFFECTEE, Vehicle → AFFECTE, Driver → AFFECTE
    mission.status = MissionStatus.AFFECTEE
    vehicle!.status = VehicleStatus.AFFECTE
    driver!.status = DriverStatus.AFFECTE

    this.fleetStore.setMissions(
      this.fleetStore.missions.map(m => m.id === missionId ? mission : m)
    )
    this.fleetStore.setEngins(
      this.fleetStore.engins.map(e => e.id === mission.vehicleId ? vehicle! : e)
    )
    this.fleetStore.setDrivers(
      this.fleetStore.drivers.map(d => d.id === mission.driverId ? driver! : d)
    )

    this.logAudit(AuditAction.ASSIGN_MISSION, `Mission ${missionId} affectée`)
    return mission
  }

  /**
   * ===============================================
   * PHASE 3: DÉMARRAGE DE MISSION
   * ===============================================
   */
  startMission(
    missionId: string,
    departureData: { km: number; engineHours: number; fuelLevel: number }
  ): Mission {
    const mission = this.fleetStore.getMissionById(missionId)
    if (!mission) throw new Error('Mission non trouvée')
    if (mission.status !== MissionStatus.AFFECTEE) {
      throw new Error('Mission non affectée')
    }

    const vehicle = this.fleetStore.getVehicleById(mission.vehicleId)
    const driver = this.fleetStore.getDriverById(mission.driverId)

    // Transitions: Mission → EN_COURS, Vehicle → EN_MISSION, Driver → EN_MISSION
    mission.status = MissionStatus.EN_COURS
    mission.departureKm = departureData.km
    mission.departureTime = new Date().toISOString()

    vehicle!.status = VehicleStatus.EN_MISSION
    vehicle!.km = departureData.km
    vehicle!.engineHours = departureData.engineHours
    vehicle!.fuelLevel = departureData.fuelLevel

    driver!.status = DriverStatus.EN_MISSION

    this.fleetStore.setMissions(
      this.fleetStore.missions.map(m => m.id === missionId ? mission : m)
    )
    this.fleetStore.setEngins(
      this.fleetStore.engins.map(e => e.id === mission.vehicleId ? vehicle! : e)
    )
    this.fleetStore.setDrivers(
      this.fleetStore.drivers.map(d => d.id === mission.driverId ? driver! : d)
    )

    this.logAudit(AuditAction.START_MISSION, `Mission ${missionId} démarrée`)
    return mission
  }

  /**
   * ===============================================
   * PHASE 4: RETOUR DE MISSION
   * ===============================================
   */
  returnMission(
    missionId: string,
    arrivalData: { km: number; engineHours: number; fuelLevel: number }
  ): Mission {
    const mission = this.fleetStore.getMissionById(missionId)
    if (!mission) throw new Error('Mission non trouvée')
    if (mission.status !== MissionStatus.EN_COURS) {
      throw new Error('Mission non en cours')
    }

    const vehicle = this.fleetStore.getVehicleById(mission.vehicleId)
    const driver = this.fleetStore.getDriverById(mission.driverId)

    // Transitions: Mission → RETOUR, Vehicle → RETOUR_EN_ATTENTE_CONTROLE
    mission.status = MissionStatus.RETOUR
    mission.arrivalKm = arrivalData.km
    mission.arrivalTime = new Date().toISOString()

    vehicle!.status = VehicleStatus.RETOUR_EN_ATTENTE_CONTROLE
    vehicle!.km = arrivalData.km
    vehicle!.engineHours = arrivalData.engineHours
    vehicle!.fuelLevel = arrivalData.fuelLevel

    driver!.status = DriverStatus.DISPONIBLE

    this.fleetStore.setMissions(
      this.fleetStore.missions.map(m => m.id === missionId ? mission : m)
    )
    this.fleetStore.setEngins(
      this.fleetStore.engins.map(e => e.id === mission.vehicleId ? vehicle! : e)
    )
    this.fleetStore.setDrivers(
      this.fleetStore.drivers.map(d => d.id === mission.driverId ? driver! : d)
    )

    // Auto-générer alerte
    const alert: Alert = {
      id: `ALR-${Date.now()}`,
      missionId,
      type: AlertType.RETURN_PENDING,
      message: `Mission ${missionId} en attente de validation`,
      createdAt: new Date().toISOString()
    }
    this.fleetStore.setAlerts([...this.fleetStore.alerts, alert])

    this.logAudit(AuditAction.RETURN_MISSION, `Mission ${missionId} retournée`)
    return mission
  }

  /**
   * ===============================================
   * PHASE 5: VALIDATION DE RETOUR
   * ===============================================
   */
  validateReturn(missionId: string, isConform: boolean = true): Mission {
    const mission = this.fleetStore.getMissionById(missionId)
    if (!mission) throw new Error('Mission non trouvée')
    if (mission.status !== MissionStatus.RETOUR) {
      throw new Error('Mission non en retour')
    }

    const vehicle = this.fleetStore.getVehicleById(mission.vehicleId)

    // Transition: Mission → CLOTUREE ou CLOTUREE_AVEC_ANOMALIE
    mission.status = isConform
      ? MissionStatus.CLOTUREE
      : MissionStatus.CLOTUREE_AVEC_ANOMALIE

    vehicle!.status = VehicleStatus.DISPONIBLE

    this.fleetStore.setMissions(
      this.fleetStore.missions.map(m => m.id === missionId ? mission : m)
    )
    this.fleetStore.setEngins(
      this.fleetStore.engins.map(e => e.id === mission.vehicleId ? vehicle! : e)
    )

    this.logAudit(
      AuditAction.VALIDATE_RETURN,
      `Mission ${missionId} validée (${isConform ? 'conforme' : 'anomalie'})`
    )

    return mission
  }

  /**
   * ===============================================
   * CARBURANT
   * ===============================================
   */
  recordFuel(
    missionId: string,
    fuelData: {
      quantity: number
      cost: number
      station: string
      receiptUrl: string
    }
  ): FuelEntry {
    const mission = this.fleetStore.getMissionById(missionId)
    if (!mission) throw new Error('Mission non trouvée')

    const entry: FuelEntry = {
      id: `FUL-${Date.now()}`,
      missionId,
      quantity: fuelData.quantity,
      cost: fuelData.cost,
      station: fuelData.station,
      receiptUrl: fuelData.receiptUrl,
      createdAt: new Date().toISOString()
    }

    this.fleetStore.setFuelEntries([...this.fleetStore.fuelEntries, entry])
    this.logAudit(
      AuditAction.FUEL_ENTRY_CREATED,
      `${fuelData.quantity}L @ ${fuelData.station}`
    )

    return entry
  }

  /**
   * ===============================================
   * MAINTENANCE
   * ===============================================
   */
  sendVehicleToMaintenance(vehicleId: string, reason: string): Vehicle {
    const vehicle = this.fleetStore.getVehicleById(vehicleId)
    if (!vehicle) throw new Error('Véhicule non trouvé')

    vehicle.status = VehicleStatus.MAINTENANCE

    this.fleetStore.setEngins(
      this.fleetStore.engins.map(e => e.id === vehicleId ? vehicle : e)
    )

    this.logAudit(AuditAction.SEND_MAINTENANCE, reason)
    return vehicle
  }

  releaseVehicle(vehicleId: string): Vehicle {
    const vehicle = this.fleetStore.getVehicleById(vehicleId)
    if (!vehicle) throw new Error('Véhicule non trouvé')

    vehicle.status = VehicleStatus.DISPONIBLE

    this.fleetStore.setEngins(
      this.fleetStore.engins.map(e => e.id === vehicleId ? vehicle : e)
    )

    this.logAudit(AuditAction.RELEASE_MAINTENANCE, 'Véhicule libéré de maintenance')
    return vehicle
  }

  /**
   * ===============================================
   * QUERIES
   * ===============================================
   */
  getEligibleVehicles(): Vehicle[] {
    return this.fleetStore.getEligibleVehicles()
  }

  getEligibleDrivers(): DriverProfile[] {
    return this.fleetStore.getEligibleDrivers()
  }

  getDriverMissions(driverId: string): Mission[] {
    return this.fleetStore.getDriverMissions(driverId)
  }

  getMissionFuelEntries(missionId: string): FuelEntry[] {
    return this.fleetStore.getMissionFuelEntries(missionId)
  }

  /**
   * ===============================================
   * AUDIT
   * ===============================================
   */
  private logAudit(action: AuditAction, description: string) {
    const log: AuditLog = {
      id: `AUD-${Date.now()}`,
      action,
      description,
      actorId: this.currentActorId,
      actorRole: this.currentActorRole,
      timestamp: new Date().toISOString()
    }

    this.fleetStore.setAuditLogs([...this.fleetStore.auditLogs, log])
  }
}

export const missionOrchestrator = new MissionOrchestrator()
