import { create } from 'zustand'
import { Engin, Projet, Affectation, Rapport, AlertFlotte } from '@/types'

interface FleetState {
  engins: Engin[]
  projets: Projet[]
  affectations: Affectation[]
  rapports: Rapport[]
  alertes: AlertFlotte[]

  setEngins: (engins: Engin[]) => void
  setProjets: (projets: Projet[]) => void
  setAffectations: (affectations: Affectation[]) => void
  setRapports: (rapports: Rapport[]) => void
  setAlertes: (alertes: AlertFlotte[]) => void

  fetchEngins: () => Promise<void>
  fetchProjets: () => Promise<void>
  fetchAlertes: () => Promise<void>

  getStatistiques: () => {
    totalEngins: number
    enDisponibilite: number
    enChantier: number
    enPanne: number
    locationExterne: number
  }
}

export const useFleetStore = create<FleetState>((set, get) => ({
  engins: [],
  projets: [],
  affectations: [],
  rapports: [],
  alertes: [],

  setEngins: (engins) => set({ engins }),
  setProjets: (projets) => set({ projets }),
  setAffectations: (affectations) => set({ affectations }),
  setRapports: (rapports) => set({ rapports }),
  setAlertes: (alertes) => set({ alertes }),

  fetchEngins: async () => {
    try {
      const response = await fetch('/api/engins')
      const engins = await response.json()
      set({ engins })
    } catch (error) {
      console.error('Error fetching engins:', error)
    }
  },

  fetchProjets: async () => {
    try {
      const response = await fetch('/api/projets')
      const projets = await response.json()
      set({ projets })
    } catch (error) {
      console.error('Error fetching projets:', error)
    }
  },

  fetchAlertes: async () => {
    try {
      const response = await fetch('/api/alertes')
      const alertes = await response.json()
      set({ alertes })
    } catch (error) {
      console.error('Error fetching alertes:', error)
    }
  },

  getStatistiques: () => {
    const { engins } = get()
    return {
      totalEngins: engins.length,
      enDisponibilite: engins.filter(e => e.status === 'disponible').length,
      enChantier: engins.filter(e => e.status === 'en_chantier').length,
      enPanne: engins.filter(e => e.status === 'en_panne').length,
      locationExterne: engins.filter(e => e.status === 'location_externe').length
    }
  }
}))
