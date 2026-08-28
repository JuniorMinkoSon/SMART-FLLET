import { create } from 'zustand'

export interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  action: string
  missionId?: string
  vehicleId?: string
  driverId?: string
  details: Record<string, unknown>
}

interface AuditState {
  events: AuditEvent[]
  log: (event: Omit<AuditEvent, 'id' | 'timestamp'>) => void
  getEventsByMission: (missionId: string) => AuditEvent[]
  clear: () => void
}

let seq = 0

export const useAuditStore = create<AuditState>((set, get) => ({
  events: [],

  log: (event) =>
    set((s) => {
      const newEvent: AuditEvent = {
        ...event,
        id: `audit${++seq}`,
        timestamp: new Date().toISOString(),
      }
      return { events: [newEvent, ...s.events] }
    }),

  getEventsByMission: (missionId) =>
    get().events.filter((e) => e.missionId === missionId),

  clear: () => set({ events: [] }),
}))
