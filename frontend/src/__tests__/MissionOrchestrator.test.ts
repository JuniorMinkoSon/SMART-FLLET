import { describe, it, expect, beforeEach } from 'vitest'
import { useFleetStore } from '@/store/fleetStore'
import { useAuditStore } from '@/store/auditStore'
import { missionOrchestrator } from '@/services/MissionOrchestrator'

describe('MissionOrchestrator', () => {
  beforeEach(() => {
    useFleetStore.setState({
      vehicles: [
        {
          id: 'v1',
          code: 'P-001',
          type: 'Pelle',
          name: 'Pelle hydraulique',
          plate: 'CI-001',
          status: 'disponible',
          km: 100,
          engineHours: 10,
          fuelLevel: 80,
          condition: 'Bon',
        },
        {
          id: 'v2',
          code: 'B-002',
          type: 'Bulldozer',
          name: 'Bulldozer',
          plate: 'CI-002',
          status: 'disponible',
          km: 200,
          engineHours: 20,
          fuelLevel: 70,
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
          skills: ['Pelle', 'Camion', 'Bulldozer'],
          status: 'disponible',
        },
        {
          id: 'd2',
          name: 'Driver B',
          matricule: 'DB-002',
          phone: '234567',
          license: 'CE',
          skills: ['Bulldozer'],
          status: 'disponible',
        },
      ],
      missions: [],
      fuelEntries: [],
      expenses: [],
      alerts: [],
    })
    useAuditStore.setState({ events: [] })
  })

  describe('Habilitation validation', () => {
    it('TEST 1: Should create mission with valid skills', () => {
      missionOrchestrator.setActor('u1', 'admin')
      const mission = missionOrchestrator.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })
      expect(mission.id).toBeDefined()
      expect(mission.status).toBe('affectee')
    })

    it('TEST 2: Should reject mission with invalid skills', () => {
      missionOrchestrator.setActor('u1', 'admin')
      expect(() => {
        missionOrchestrator.createMission({
          site: 'Chantier B',
          vehicleId: 'v1',
          driverId: 'd2',
          startDate: '2026-09-01',
          endDate: '2026-09-05',
          budget: 5000,
        })
      }).toThrow(/habilité/)
    })
  })

  describe('Date conflict detection', () => {
    it('TEST 3: Should reject mission with vehicle date overlap', () => {
      missionOrchestrator.setActor('u1', 'admin')
      missionOrchestrator.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        budget: 5000,
      })

      expect(() => {
        missionOrchestrator.createMission({
          site: 'Chantier B',
          vehicleId: 'v1',
          driverId: 'd1',
          startDate: '2026-09-05',
          endDate: '2026-09-15',
          budget: 6000,
        })
      }).toThrow(/réservé/)
    })

    it('TEST 4: Should reject mission with driver date overlap', () => {
      missionOrchestrator.setActor('u1', 'admin')
      missionOrchestrator.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        budget: 5000,
      })

      expect(() => {
        missionOrchestrator.createMission({
          site: 'Chantier B',
          vehicleId: 'v2',
          driverId: 'd1',
          startDate: '2026-09-05',
          endDate: '2026-09-15',
          budget: 6000,
        })
      }).toThrow(/affecté/)
    })

    it('TEST 5: Should create mission with available equipment and driver', () => {
      missionOrchestrator.setActor('u1', 'admin')
      const m1 = missionOrchestrator.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      const m2 = missionOrchestrator.createMission({
        site: 'Chantier B',
        vehicleId: 'v2',
        driverId: 'd2',
        startDate: '2026-09-10',
        endDate: '2026-09-15',
        budget: 6000,
      })

      expect(m1.id).toBeDefined()
      expect(m2.id).toBeDefined()
    })
  })

  describe('State machine transitions', () => {
    it('TEST 6: Should record departure for affectee mission', () => {
      missionOrchestrator.setActor('u1', 'admin')
      const m = missionOrchestrator.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      const started = missionOrchestrator.startMission(m.id, {
        km: 100,
        engineHours: 10,
        fuelLevel: 80,
        checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
      })
      expect(started.status).toBe('en_cours')
    })

    it('TEST 7: Should not record departure for non-affectee mission', () => {
      missionOrchestrator.setActor('u1', 'admin')
      const m = missionOrchestrator.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      missionOrchestrator.startMission(m.id, {
        km: 100,
        engineHours: 10,
        fuelLevel: 80,
        checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
      })

      expect(() => {
        missionOrchestrator.startMission(m.id, {
          km: 120,
          engineHours: 12,
          fuelLevel: 75,
          checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
        })
      }).toThrow(/affectée/)
    })

    it('TEST 8: Should record return for en_cours mission', () => {
      missionOrchestrator.setActor('u1', 'admin')
      const m = missionOrchestrator.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      missionOrchestrator.startMission(m.id, {
        km: 100,
        engineHours: 10,
        fuelLevel: 80,
        checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
      })

      const returned = missionOrchestrator.returnMission(m.id, {
        km: 150,
        engineHours: 15,
        fuelLevel: 60,
        checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
      })
      expect(returned.status).toBe('controle')
    })

    it('TEST 9: Should not record return for non-en_cours mission', () => {
      missionOrchestrator.setActor('u1', 'admin')
      const m = missionOrchestrator.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      expect(() => {
        missionOrchestrator.returnMission(m.id, {
          km: 150,
          engineHours: 15,
          fuelLevel: 60,
          checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
        })
      }).toThrow(/cours/)
    })

    it('TEST 10: Should validate return for controle mission', () => {
      missionOrchestrator.setActor('u1', 'admin')
      const m = missionOrchestrator.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      missionOrchestrator.startMission(m.id, {
        km: 100,
        engineHours: 10,
        fuelLevel: 80,
        checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
      })

      missionOrchestrator.returnMission(m.id, {
        km: 150,
        engineHours: 15,
        fuelLevel: 60,
        checklist: { pneus: true, freins: true, eclairage: true, carrosserie: true },
      })

      const validated = missionOrchestrator.validateReturn(m.id, true)
      expect(validated.status).toBe('cloturee')
    })
  })

  describe('Audit trail', () => {
    it('Should log audit events for all mission actions', () => {
      missionOrchestrator.setActor('u1', 'admin')
      const m = missionOrchestrator.createMission({
        site: 'Chantier A',
        vehicleId: 'v1',
        driverId: 'd1',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        budget: 5000,
      })

      const events = useAuditStore.getState().getEventsByMission(m.id)
      expect(events.length).toBeGreaterThan(0)
      expect(events[0].action).toBe('mission.created')
    })
  })
})
