import { create } from 'zustand'
import { useApiStore } from './apiStore'
import { toVehicle, toDriver, toMission, toAlert } from '@/services/adapters'
import type {
  Vehicle, Driver, Mission, FuelEntry, Expense, FleetAlert, CounterReading,
} from '@/types'

/**
 * État de la flotte, alimenté par le serveur.
 *
 * Ce magasin ne détient aucune donnée simulée : tout vient de l'API et y
 * retourne. Il joue le rôle de cache partagé entre les écrans — quatorze pages
 * lisent le même état, et un rechargement après écriture suffit à les remettre
 * toutes d'accord, sans que chacune ait à réinterroger le serveur.
 *
 * Les écritures suivent toujours le même schéma : appel serveur, puis
 * rechargement. Mettre l'état à jour localement en même temps donnerait une
 * réponse plus vive mais laisserait l'écran diverger de la base dès qu'une règle
 * serveur intervient — l'anti-surréservation, un changement de statut en
 * cascade. Ici l'affichage montre toujours ce qui est réellement enregistré.
 */

interface FleetState {
  vehicles: Vehicle[]
  drivers: Driver[]
  missions: Mission[]
  fuelEntries: FuelEntry[]
  expenses: Expense[]
  alerts: FleetAlert[]

  /** Vrai pendant le premier chargement, pour distinguer « vide » de « pas encore lu ». */
  loading: boolean
  /** Message d'erreur du dernier appel, à afficher tel quel. */
  error: string | null
  /** Faux tant qu'aucun chargement n'a abouti. */
  loaded: boolean

  /** Charge l'ensemble de la flotte. Appelé au montage de l'espace connecté. */
  load: () => Promise<void>
  /** Recharge sans repasser par l'état de chargement initial. */
  refresh: () => Promise<void>

  addVehicle: (v: Omit<Vehicle, 'id'>) => Promise<void>
  addDriver: (d: Omit<Driver, 'id'>) => Promise<void>
  createMission: (data: {
    site: string
    client?: string
    vehicleId: string
    driverId: string
    startDate: string
    endDate: string
    budget: number
  }) => Promise<Mission | null>
  recordDeparture: (missionId: string, reading: Omit<CounterReading, 'time'>) => Promise<void>
  recordReturn: (missionId: string, reading: Omit<CounterReading, 'time'>) => Promise<void>
  validateReturn: (missionId: string) => Promise<void>
  sendToMaintenance: (missionId: string) => Promise<void>
  addFuelEntry: (f: Omit<FuelEntry, 'id'>) => Promise<void>
  addExpense: (e: Omit<Expense, 'id'>) => Promise<void>
  markAlertsRead: () => void
}

/** Message lisible : l'écran affiche cette chaîne telle quelle. */
function describe(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Le serveur est injoignable.'
}

/** Les dates de mission sont saisies au jour ; le serveur attend une date seule. */
function toDateOnly(value: string): string {
  return value.length > 10 ? value.slice(0, 10) : value
}

export const useFleetStore = create<FleetState>((set, get) => ({
  vehicles: [],
  drivers: [],
  missions: [],
  fuelEntries: [],
  expenses: [],
  alerts: [],

  loading: false,
  error: null,
  loaded: false,

  load: async () => {
    set({ loading: true, error: null })
    await get().refresh()
    set({ loading: false, loaded: true })
  },

  refresh: async () => {
    const api = useApiStore.getState()

    try {
      // Les quatre lectures partent ensemble : elles sont indépendantes, et les
      // enchaîner tripleraient le temps d'affichage du tableau de bord.
      const [vehicles, drivers, missions, alerts] = await Promise.all([
        api.fetch<unknown[]>('/vehicles'),
        api.fetch<unknown[]>('/drivers'),
        api.fetch<unknown[]>('/missions'),
        // Les alertes ne sont lisibles que par les rôles de gestion : leur
        // refus ne doit pas vider la flotte pour un conducteur.
        api.fetch<unknown[]>('/alerts').catch(() => [] as unknown[]),
      ])

      set({
        vehicles: (vehicles ?? []).map((v) => toVehicle(v as never)),
        drivers: (drivers ?? []).map((d) => toDriver(d as never)),
        missions: (missions ?? []).map((m) => toMission(m as never)),
        alerts: (alerts ?? []).map((a) => toAlert(a as never)),
        error: null,
      })
    } catch (err) {
      // L'état précédent est conservé : effacer la flotte sur un incident
      // réseau ferait croire à une flotte vide.
      set({ error: describe(err) })
    }
  },

  addVehicle: async (v) => {
    const api = useApiStore.getState()
    try {
      await api.fetch('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          code: v.code,
          type: v.type,
          licensePlate: v.plate,
          initialKm: v.km,
          currentKm: v.km,
          engineHours: v.engineHours,
          fuelLevel: v.fuelLevel,
        }),
      })
      await get().refresh()
    } catch (err) {
      set({ error: describe(err) })
    }
  },

  addDriver: async (d) => {
    const api = useApiStore.getState()
    try {
      await api.fetch('/drivers', {
        method: 'POST',
        body: JSON.stringify({
          name: d.name,
          email: `${d.matricule || d.name.toLowerCase().replace(/\s+/g, '.')}@smartfleet.local`,
          phone: d.phone,
          licenseType: d.license,
          skills: d.skills,
        }),
      })
      await get().refresh()
    } catch (err) {
      set({ error: describe(err) })
    }
  },

  createMission: async (data) => {
    const api = useApiStore.getState()
    try {
      const created = await api.fetch<Record<string, unknown>>('/missions', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: data.vehicleId,
          driverId: data.driverId,
          startDate: toDateOnly(data.startDate),
          endDate: toDateOnly(data.endDate),
          site: data.site,
          client: data.client,
          budget: data.budget,
        }),
      })
      await get().refresh()
      return toMission(created as never)
    } catch (err) {
      // Le serveur refuse une affectation qui chevauche une mission existante :
      // son message nomme le conflit et doit remonter tel quel.
      set({ error: describe(err) })
      return null
    }
  },

  recordDeparture: async (missionId, reading) => {
    const api = useApiStore.getState()
    try {
      await api.fetch(`/missions/${missionId}/start`, {
        method: 'POST',
        body: JSON.stringify({
          km: reading.km,
          engineHours: reading.engineHours,
          fuel: reading.fuelLevel,
        }),
      })
      await get().refresh()
    } catch (err) {
      set({ error: describe(err) })
    }
  },

  recordReturn: async (missionId, reading) => {
    const api = useApiStore.getState()
    try {
      await api.fetch(`/missions/${missionId}/return`, {
        method: 'POST',
        body: JSON.stringify({
          km: reading.km,
          engineHours: reading.engineHours,
          fuel: reading.fuelLevel,
        }),
      })
      await get().refresh()
    } catch (err) {
      set({ error: describe(err) })
    }
  },

  validateReturn: async (missionId) => {
    const api = useApiStore.getState()
    try {
      await api.fetch(`/missions/${missionId}/validate`, {
        method: 'POST',
        body: JSON.stringify({ isConform: true }),
      })
      await get().refresh()
    } catch (err) {
      set({ error: describe(err) })
    }
  },

  sendToMaintenance: async (missionId) => {
    const api = useApiStore.getState()
    try {
      // Un retour non conforme envoie le véhicule en atelier : c'est le serveur
      // qui en tire les conséquences sur son statut.
      await api.fetch(`/missions/${missionId}/validate`, {
        method: 'POST',
        body: JSON.stringify({ isConform: false }),
      })
      await get().refresh()
    } catch (err) {
      set({ error: describe(err) })
    }
  },

  addFuelEntry: async (f) => {
    const api = useApiStore.getState()
    try {
      await api.fetch('/fuel-entries', {
        method: 'POST',
        body: JSON.stringify({
          missionId: f.missionId,
          quantity: f.liters,
          cost: f.amount,
          station: f.station,
        }),
      })
      await get().refresh()
    } catch (err) {
      // L'endpoint de saisie n'existe pas encore côté serveur : l'écran doit le
      // dire plutôt que de laisser croire à un enregistrement.
      set({ error: describe(err) })
    }
  },

  addExpense: async () => {
    // Les dépenses n'ont ni entité ni endpoint : annoncer un enregistrement
    // serait mentir sur ce que fait le bouton.
    set({ error: "L'enregistrement des dépenses n'est pas encore disponible." })
  },

  markAlertsRead: () => {
    // Les alertes sont recalculées à chaque lecture à partir de l'état de la
    // flotte : rien n'est stocké côté serveur qu'on pourrait marquer comme lu.
    // Le repère reste local à la session.
    set((s) => ({ alerts: s.alerts.map((a) => ({ ...a, read: true })) }))
  },
}))
