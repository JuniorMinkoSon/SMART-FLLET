export type UserRole = 'admin' | 'chef_projet' | 'operateur' | 'dg'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Engin {
  id: string
  code: string
  nom: string
  type: string
  status: 'disponible' | 'en_chantier' | 'en_panne' | 'maintenance' | 'location_externe'
  km: number
  carburant: number
  valeurAcquisition: number
  dureeAmortissement: number
}

export interface Projet {
  id: string
  nom: string
  client: string
  localisation: string
  dateDebut: string
  dateFin: string
  chefProjet: string
  engins: Engin[]
  statut: 'planifie' | 'en_cours' | 'termine'
}

export interface Affectation {
  id: string
  projet: string
  engin: string
  operateur: string
  dateDebut: string
  dateFin: string
  statut: 'active' | 'terminee'
}

export interface Rapport {
  id: string
  date: string
  engin: string
  operateur: string
  km: number
  kmPrecedent: number
  carburantAjoute: number
  montantCarburant: number
  station: string
  etat: 'en_service' | 'en_panne' | 'stand_by'
  preuves: string[]
  incident?: {
    type: string
    description: string
    niveau: 'normal' | 'important' | 'urgent'
  }
}

export interface LocationExterne {
  id: string
  client: string
  engin: string
  operateur: string
  dateDebut: string
  dateRetour: string
  tarifParJour: number
  statut: 'active' | 'terminee'
}

export interface AlertFlotte {
  id: string
  type: 'panne' | 'rapport_manquant' | 'maintenance' | 'location_expiration'
  severite: 'normal' | 'important' | 'urgent'
  message: string
  engin?: string
  date: string
}
