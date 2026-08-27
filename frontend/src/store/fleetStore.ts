import { create } from 'zustand'
import {
  Vehicle,
  Driver,
  Mission,
  FuelEntry,
  Expense,
  FleetAlert,
  CounterReading,
} from '@/types'
import {
  VEHICLES,
  DRIVERS,
  MISSIONS,
  FUEL_ENTRIES,
  EXPENSES,
  ALERTS,
} from '@/data/mockData'

let seq = 100

function nextId(prefix: string): string {
  seq += 1
  return `${prefix}${seq}`
}

function now(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface FleetState {
  vehicles: Vehicle[]
  drivers: Driver[]
  missions: Mission[]
  fuelEntries: FuelEntry[]
  expenses: Expense[]
  alerts: FleetAlert[]

  addVehicle: (v: Omit<Vehicle, 'id'>) => void
  addDriver: (d: Omit<Driver, 'id'>) => void
  createMission: (data: {
    site: string
    vehicleId: string
    driverId: string
    startDate: string
    endDate: string
    budget: number
  }) => Mission
  recordDeparture: (missionId: string, reading: Omit<CounterReading, 'time'>) => void
  recordReturn: (missionId: string, reading: Omit<CounterReading, 'time'>) => void
  validateReturn: (missionId: string) => void
  sendToMaintenance: (missionId: string) => void
  addFuelEntry: (f: Omit<FuelEntry, 'id'>) => void
  addExpense: (e: Omit<Expense, 'id'>) => void
  markAlertsRead: () => void
}

export const useFleetStore = create<FleetState>((set, get) => ({
  vehicles: VEHICLES,
  drivers: DRIVERS,
  missions: MISSIONS,
  fuelEntries: FUEL_ENTRIES,
  expenses: EXPENSES,
  alerts: ALERTS,

  addVehicle: (v) =>
    set((s) => ({ vehicles: [...s.vehicles, { ...v, id: nextId('v') }] })),

  addDriver: (d) =>
    set((s) => ({ drivers: [...s.drivers, { ...d, id: nextId('d') }] })),

  createMission: (data) => {
    const count = get().missions.length
    const mission: Mission = {
      id: nextId('m'),
      code: `MS-${String(84 + count - 4).padStart(4, '0')}`,
      status: 'affectee',
      timeline: [
        { label: 'Mission créée', time: now() },
        { label: 'Engin affecté', time: now() },
      ],
      ...data,
    }
    set((s) => ({
      missions: [mission, ...s.missions],
      vehicles: s.vehicles.map((v) =>
        v.id === data.vehicleId
          ? { ...v, status: 'affecte', site: data.site, driverId: data.driverId }
          : v
      ),
      drivers: s.drivers.map((d) =>
        d.id === data.driverId ? { ...d, status: 'en_mission' } : d
      ),
    }))
    return mission
  },

  recordDeparture: (missionId, reading) =>
    set((s) => {
      const mission = s.missions.find((m) => m.id === missionId)
      if (!mission) return s
      return {
        missions: s.missions.map((m) =>
          m.id === missionId
            ? {
                ...m,
                status: 'en_cours',
                departure: { ...reading, time: now() },
                timeline: [...m.timeline, { label: 'Départ enregistré', time: now() }],
              }
            : m
        ),
        vehicles: s.vehicles.map((v) =>
          v.id === mission.vehicleId
            ? {
                ...v,
                status: 'en_mission',
                km: reading.km,
                engineHours: reading.engineHours,
                fuelLevel: reading.fuelLevel,
              }
            : v
        ),
      }
    }),

  recordReturn: (missionId, reading) =>
    set((s) => {
      const mission = s.missions.find((m) => m.id === missionId)
      if (!mission) return s
      return {
        missions: s.missions.map((m) =>
          m.id === missionId
            ? {
                ...m,
                status: 'controle',
                arrival: { ...reading, time: now() },
                timeline: [...m.timeline, { label: 'Retour enregistré', time: now() }],
              }
            : m
        ),
        vehicles: s.vehicles.map((v) =>
          v.id === mission.vehicleId
            ? {
                ...v,
                status: 'controle',
                km: reading.km,
                engineHours: reading.engineHours,
                fuelLevel: reading.fuelLevel,
              }
            : v
        ),
        alerts: [
          {
            id: nextId('a'),
            severity: 'urgent' as const,
            title: `Retour à contrôler — mission ${mission.code}`,
            detail: 'Un retour de mission attend votre contrôle.',
            time: 'À l’instant',
            read: false,
          },
          ...s.alerts,
        ],
      }
    }),

  validateReturn: (missionId) =>
    set((s) => {
      const mission = s.missions.find((m) => m.id === missionId)
      if (!mission) return s
      return {
        missions: s.missions.map((m) =>
          m.id === missionId
            ? {
                ...m,
                status: 'cloturee',
                timeline: [...m.timeline, { label: 'Retour validé — mission clôturée', time: now() }],
              }
            : m
        ),
        vehicles: s.vehicles.map((v) =>
          v.id === mission.vehicleId
            ? { ...v, status: 'disponible', site: undefined, driverId: undefined }
            : v
        ),
        drivers: s.drivers.map((d) =>
          d.id === mission.driverId ? { ...d, status: 'disponible' } : d
        ),
      }
    }),

  sendToMaintenance: (missionId) =>
    set((s) => {
      const mission = s.missions.find((m) => m.id === missionId)
      if (!mission) return s
      return {
        missions: s.missions.map((m) =>
          m.id === missionId
            ? {
                ...m,
                status: 'cloturee',
                timeline: [...m.timeline, { label: 'Engin envoyé en maintenance', time: now() }],
              }
            : m
        ),
        vehicles: s.vehicles.map((v) =>
          v.id === mission.vehicleId
            ? { ...v, status: 'maintenance', site: undefined, driverId: undefined }
            : v
        ),
        drivers: s.drivers.map((d) =>
          d.id === mission.driverId ? { ...d, status: 'disponible' } : d
        ),
      }
    }),

  addFuelEntry: (f) =>
    set((s) => ({
      fuelEntries: [{ ...f, id: nextId('f') }, ...s.fuelEntries],
      expenses: [
        {
          id: nextId('e'),
          vehicleId: f.vehicleId,
          missionId: f.missionId,
          category: 'Carburant' as const,
          label: `Ravitaillement ${s.vehicles.find((v) => v.id === f.vehicleId)?.code ?? ''}`,
          amount: f.amount,
          date: f.date,
        },
        ...s.expenses,
      ],
    })),

  addExpense: (e) =>
    set((s) => ({ expenses: [{ ...e, id: nextId('e') }, ...s.expenses] })),

  markAlertsRead: () =>
    set((s) => ({ alerts: s.alerts.map((a) => ({ ...a, read: true })) })),
}))
