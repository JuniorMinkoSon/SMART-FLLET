import type {
  Vehicle, Driver, Mission, FleetAlert, FuelEntry,
  VehicleStatus, MissionStatus, CounterReading, TimelineEvent, ChecklistState,
} from '@/types'

/**
 * Traduction des réponses du serveur vers les types de l'interface.
 *
 * Les deux côtés nomment les mêmes choses différemment : le serveur écrit les
 * énumérations en capitales (`EN_MISSION`), l'interface en minuscules
 * (`en_mission`). Cette traduction est faite ici, en un seul endroit, plutôt que
 * dans chaque écran — sinon un statut oublié quelque part produit une carte
 * vide sans erreur visible.
 *
 * Les valeurs inconnues ne sont jamais rejetées : un véhicule dont le statut
 * n'est pas reconnu reste affiché avec un état par défaut, plutôt que de
 * disparaître de la flotte sur une valeur inattendue.
 */

// ---------------------------------------------------------------------------
// Énumérations
// ---------------------------------------------------------------------------

const VEHICLE_STATUS: Record<string, VehicleStatus> = {
  DISPONIBLE: 'disponible',
  RESERVE: 'reserve',
  EN_MISSION: 'en_mission',
  CONTROLE: 'controle',
  MAINTENANCE: 'maintenance',
  HORS_SERVICE: 'hors_service',
}

const MISSION_STATUS: Record<string, MissionStatus> = {
  AFFECTEE: 'affectee',
  EN_COURS: 'en_cours',
  CONTROLE: 'controle',
  CLOTUREE: 'cloturee',
}

const DRIVER_STATUS: Record<string, Driver['status']> = {
  DISPONIBLE: 'disponible',
  RESERVE: 'reserve',
  EN_MISSION: 'en_mission',
  INDISPONIBLE: 'indisponible',
}

/** Conversion inverse, pour les valeurs envoyées au serveur. */
export function toServerVehicleStatus(status: VehicleStatus): string {
  return status.toUpperCase()
}

// ---------------------------------------------------------------------------
// Véhicule
// ---------------------------------------------------------------------------

interface VehicleDto {
  id: string
  code: string
  type: string
  name?: string | null
  plate: string
  status: string
  initialKm?: number
  km?: number
  engineHours?: number
  fuelLevel?: number
  condition?: string | null
  site?: string | null
  ownership?: string | null
  ownerCompany?: string | null
  contractEndDate?: string | null
  driverId?: string | null
  driverName?: string | null
}

export function toVehicle(dto: VehicleDto): Vehicle {
  return {
    id: dto.id,
    code: dto.code,
    type: dto.type,
    // Le nom d'usage n'est pas toujours saisi : le code d'inventaire prend le
    // relais pour que la ligne reste identifiable.
    name: dto.name?.trim() || dto.code,
    plate: dto.plate,
    status: VEHICLE_STATUS[dto.status] ?? 'disponible',
    km: dto.km ?? 0,
    engineHours: dto.engineHours ?? 0,
    fuelLevel: dto.fuelLevel ?? 0,
    condition: toCondition(dto.condition),
    site: dto.site ?? undefined,
    // Sans provenance déclarée, l'engin est rattaché au parc propre : c'est le
    // cas majoritaire, et le supposer externe le sortirait à tort du bilan.
    ownership: dto.ownership === 'EXTERNE' ? 'EXTERNE' : 'INTERNE',
    ownerCompany: dto.ownerCompany ?? undefined,
    contractEndDate: dto.contractEndDate ?? undefined,
    driverId: dto.driverId ?? undefined,
  }
}

function toCondition(value?: string | null): Vehicle['condition'] {
  switch ((value ?? '').toLowerCase()) {
    case 'mauvais': return 'Mauvais'
    case 'moyen': return 'Moyen'
    default: return 'Bon'
  }
}

// ---------------------------------------------------------------------------
// Conducteur
// ---------------------------------------------------------------------------

interface DriverDto {
  id: string
  name: string
  matricule?: string | null
  phone?: string | null
  license?: string | null
  status: string
  skills?: string[] | null
  vehicleCategories?: string[] | null
}

export function toDriver(dto: DriverDto): Driver {
  return {
    id: dto.id,
    name: dto.name,
    // Un matricule non saisi est un défaut à corriger, pas une donnée à
    // inventer : le champ reste vide et l'écran peut le signaler.
    matricule: dto.matricule ?? '',
    phone: dto.phone ?? '',
    license: dto.license ?? '',
    skills: dto.skills ?? [],
    // Liste vide plutôt que valeur par défaut : une habilitation non déclarée
    // n'est pas une habilitation universelle.
    vehicleCategories: dto.vehicleCategories ?? [],
    status: DRIVER_STATUS[dto.status] ?? 'disponible',
  }
}

// ---------------------------------------------------------------------------
// Mission
// ---------------------------------------------------------------------------

/** Liste de contrôle non renseignée : aucun point n'est déclaré vérifié. */
const UNCHECKED: ChecklistState = {
  pneus: false,
  freins: false,
  eclairage: false,
  carrosserie: false,
}

interface MissionDto {
  id: string
  code: string
  site: string
  client?: string | null
  startDate: string
  endDate: string
  budget?: number | null
  status: string
  vehicleId: string
  driverId: string
  departureKm?: number | null
  departureEngineHours?: number | null
  departureFuel?: number | null
  arrivalKm?: number | null
  arrivalEngineHours?: number | null
  arrivalFuel?: number | null
  createdAt?: string
  updatedAt?: string
}

export function toMission(dto: MissionDto): Mission {
  const departure = toReading(dto.departureKm, dto.departureEngineHours, dto.departureFuel, dto.startDate)
  const arrival = toReading(dto.arrivalKm, dto.arrivalEngineHours, dto.arrivalFuel, dto.updatedAt)

  return {
    id: dto.id,
    code: dto.code,
    site: dto.site,
    client: dto.client ?? undefined,
    vehicleId: dto.vehicleId,
    driverId: dto.driverId,
    startDate: dto.startDate,
    endDate: dto.endDate,
    budget: dto.budget ?? 0,
    status: MISSION_STATUS[dto.status] ?? 'affectee',
    departure,
    arrival,
    timeline: buildTimeline(dto, departure, arrival),
  }
}

/**
 * Un relevé n'existe que si le kilométrage a été saisi : c'est lui qui atteste
 * du passage. Sans lui, l'étape n'a pas eu lieu et le relevé reste absent
 * plutôt que rempli de zéros, qui se liraient comme des mesures.
 */
function toReading(
  km?: number | null,
  engineHours?: number | null,
  fuel?: number | null,
  time?: string,
): CounterReading | undefined {
  if (km == null) return undefined
  return {
    km,
    engineHours: engineHours ?? 0,
    fuelLevel: fuel ?? 0,
    // Le serveur ne porte pas encore la liste de contrôle. Les points sont
    // donc rendus à faux, ce qui se lit comme « non vérifié » — et non comme
    // un contrôle passé avec succès.
    checklist: UNCHECKED,
    time: time ?? '',
  }
}

/**
 * Chronologie reconstruite à partir des dates et du statut.
 *
 * Le serveur ne stocke pas de journal par mission : les étapes sont déduites de
 * ce qui a été saisi. Une étape n'apparaît que si sa trace existe.
 */
function buildTimeline(
  dto: MissionDto,
  departure?: CounterReading,
  arrival?: CounterReading,
): TimelineEvent[] {
  const events: TimelineEvent[] = []

  if (dto.createdAt) {
    events.push({ label: 'Mission créée', time: dto.createdAt })
  }
  if (departure) {
    events.push({ label: 'Départ enregistré', time: departure.time })
  }
  if (arrival) {
    events.push({ label: 'Retour enregistré', time: arrival.time })
  }
  if (dto.status === 'CLOTUREE' && dto.updatedAt) {
    events.push({ label: 'Mission clôturée', time: dto.updatedAt })
  }
  return events
}

// ---------------------------------------------------------------------------
// Alerte
// ---------------------------------------------------------------------------

interface AlertDto {
  id: string
  severity: string
  title: string
  detail: string
  time: string
  read?: boolean
}

export function toAlert(dto: AlertDto): FleetAlert {
  return {
    id: dto.id,
    severity: (['urgent', 'attention', 'info'].includes(dto.severity)
      ? dto.severity
      : 'info') as FleetAlert['severity'],
    title: dto.title,
    detail: dto.detail,
    time: dto.time,
    // Les alertes sont dérivées de l'état de la flotte : rien n'est stocké
    // qu'on pourrait marquer comme lu côté serveur.
    read: dto.read ?? false,
  }
}

// ---------------------------------------------------------------------------
// Carburant
// ---------------------------------------------------------------------------

interface FuelEntryDto {
  id: string
  missionId?: string | null
  vehicleId?: string | null
  quantity?: number | null
  cost?: number | null
  station?: string | null
  createdAt?: string
}

export function toFuelEntry(dto: FuelEntryDto): FuelEntry {
  return {
    id: dto.id,
    vehicleId: dto.vehicleId ?? '',
    missionId: dto.missionId ?? undefined,
    date: dto.createdAt ?? '',
    liters: dto.quantity ?? 0,
    // Le serveur nomme ce champ « cost », l'interface « amount » : même montant,
    // deux vocabulaires.
    amount: dto.cost ?? 0,
    station: dto.station ?? undefined,
  }
}
