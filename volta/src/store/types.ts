export type EquipmentStatus = 'DISPONIBLE' | 'EN_INSPECTION' | 'CATEGORISE' | 'INDISPONIBLE'

export type EquipmentCategory = 'A' | 'B' | 'C' | 'D' | 'E'

export type QuoteRequestStatus = 'NOUVELLE' | 'TRANSMISE' | 'EN_INSPECTION' | 'RAPPORT_REÇU' | 'CATEGORISEE' | 'TERMINEE'

export type InspectionStatus = 'A_ASSIGNER' | 'ASSIGNEE' | 'EN_COURS' | 'TERMINEE' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE'

export type Role = 'ADMIN' | 'SUPPLIER' | 'TECHNICAL' | 'CLIENT'

export interface User {
  id: string
  name: string
  role: Role
  company: string
  email: string
  phone: string
  city: string
  certifications?: {
    mécanicien?: boolean
    entrepôt?: boolean
    voltaCertified?: boolean
    certificationDate?: string
  }
}

export interface Category {
  id: string
  name: string
  icon: string
}

export interface Equipment {
  id: string
  name: string
  categoryId: string
  brand: string
  model: string
  year: number
  hours: number
  location: string
  description: string
  photos: string[]
  documents: { name: string; type: string }[]
  supplierId: string
  status: EquipmentStatus
  category: EquipmentCategory | null
  declaredCondition: string
  createdAt: string
  pricePerDay?: number
  level?: 'BASIC' | 'STANDARD' | 'PREMIUM'
}

export type CheckResult = 'CONFORME' | 'A_SURVEILLER' | 'NON_CONFORME' | null

export interface ChecklistItem {
  section: string
  label: string
  result: CheckResult
  observation: string
}

export interface Inspection {
  id: string
  quoteRequestId: string
  equipmentId: string
  technicalTeamId: string
  assignedAt: string
  status: InspectionStatus
  checklist: ChecklistItem[]
  photos: string[]
  anomalies: string[]
}

export interface Report {
  id: string
  inspectionId: string
  equipmentId: string
  submittedAt: string
  summary: string
  checklist: ChecklistItem[]
}

export interface QuoteRequest {
  id: string
  reference: string
  equipmentId: string
  supplierId: string
  clientName: string
  clientCompany: string
  clientPhone: string
  clientEmail: string
  duration: string
  requestedDate: string
  location: string
  message: string
  status: QuoteRequestStatus
  createdAt: string
}

export interface Notification {
  id: string
  role: Role
  message: string
  date: string
  read: boolean
}
