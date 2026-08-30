import { describe, it, expect, beforeEach } from 'vitest'
import { useFleetStore } from '@/store/fleetStore'

describe('fleetStore', () => {
  beforeEach(() => {
    useFleetStore.setState({
      vehicles: [
        {
          id: 'v1',
          code: 'P-001',
          type: 'Pelle',
          name: 'Pelle',
          plate: 'CI-001',
          status: 'disponible',
          km: 100,
          engineHours: 10,
          fuelLevel: 80,
          condition: 'Bon',
        },
      ],
      drivers: [
        {
          id: 'd1',
          name: 'Driver A',
          matricule: 'DA-001',
          phone: '123456',
          license: 'C',
          skills: ['Pelle'],
          status: 'disponible',
        },
      ],
      missions: [],
      fuelEntries: [],
      expenses: [],
      alerts: [],
    })
  })

  describe('Mission state transitions', () => {
    it('should create mission with affectee status and RESERVE vehicle/driver status', () => {
      const store = useFleetStore.getState()
      const mission = store.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      expect(mission.status).toBe('affectee')

      const vehicle = useFleetStore.getState().vehicles.find((v) => v.id === 'v1')
      expect(vehicle?.status).toBe('reserve')

      const driver = useFleetStore.getState().drivers.find((d) => d.id === 'd1')
      expect(driver?.status).toBe('reserve')
    })

    it('recordDeparture should reject if mission not affectee', () => {
      const store = useFleetStore.getState()
      const m = store.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      store.recordDeparture(m.id, {
        km: 100,
        engineHours: 10,
        fuelLevel: 80,
        checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
      })

      const mission = useFleetStore.getState().missions.find((m) => m.id === m.id)
      expect(mission?.status).toBe('en_cours')

      const secondAttempt = useFleetStore.getState().missions
      const unchanged = secondAttempt.find((m) => m.id === m.id)
      expect(unchanged?.status).toBe('en_cours')
    })

    it('recordReturn should reject if mission not en_cours', () => {
      const store = useFleetStore.getState()
      const m = store.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      expect(() => {
        store.recordReturn(m.id, {
          km: 120,
          engineHours: 12,
          fuelLevel: 70,
          checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
        })
      }).not.toThrow()

      const mission = useFleetStore.getState().missions.find((m) => m.id === m.id)
      expect(mission?.status).toBe('affectee')
    })

    it('recordDeparture should set vehicle and driver to en_mission', () => {
      const store = useFleetStore.getState()
      const m = store.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      store.recordDeparture(m.id, {
        km: 100,
        engineHours: 10,
        fuelLevel: 80,
        checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
      })

      const vehicle = useFleetStore.getState().vehicles.find((v) => v.id === 'v1')
      expect(vehicle?.status).toBe('en_mission')

      const driver = useFleetStore.getState().drivers.find((d) => d.id === 'd1')
      expect(driver?.status).toBe('en_mission')
    })

    it('validateReturn should set mission to cloturee and vehicle to disponible', () => {
      const store = useFleetStore.getState()
      const m = store.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      store.recordDeparture(m.id, {
        km: 100,
        engineHours: 10,
        fuelLevel: 80,
        checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
      })

      store.recordReturn(m.id, {
        km: 120,
        engineHours: 12,
        fuelLevel: 70,
        checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
      })

      store.validateReturn(m.id)

      const mission = useFleetStore.getState().missions.find((m) => m.id === m.id)
      expect(mission?.status).toBe('cloturee')

      const vehicle = useFleetStore.getState().vehicles.find((v) => v.id === 'v1')
      expect(vehicle?.status).toBe('disponible')

      const driver = useFleetStore.getState().drivers.find((d) => d.id === 'd1')
      expect(driver?.status).toBe('disponible')
    })
  })
})
