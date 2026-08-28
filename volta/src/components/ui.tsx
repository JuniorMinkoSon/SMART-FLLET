import type { ReactNode } from 'react'
import type { EquipmentStatus, EquipmentCategory, QuoteRequestStatus } from '../store/types'

export const STATUS_LABELS: Record<EquipmentStatus, string> = {
  DISPONIBLE: 'Disponible',
  EN_INSPECTION: 'En inspection',
  CATEGORISE: 'Catégorisé',
  INDISPONIBLE: 'Indisponible',
}

const STATUS_COLORS: Record<EquipmentStatus, string> = {
  DISPONIBLE: 'bg-emerald-100 text-emerald-700',
  EN_INSPECTION: 'bg-amber-100 text-amber-700',
  CATEGORISE: 'bg-blue-100 text-blue-700',
  INDISPONIBLE: 'bg-red-100 text-red-700',
}

export function StatusBadge({ status }: { status: EquipmentStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export const QUOTE_STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  NOUVELLE: 'Nouvelle',
  TRANSMISE: 'Transmise',
  EN_INSPECTION: 'En inspection',
  RAPPORT_REÇU: 'Rapport reçu',
  CATEGORISEE: 'Catégorisée',
  TERMINEE: 'Terminée',
}

const QUOTE_STATUS_COLORS: Record<QuoteRequestStatus, string> = {
  NOUVELLE: 'bg-blue-100 text-blue-700',
  TRANSMISE: 'bg-purple-100 text-purple-700',
  EN_INSPECTION: 'bg-amber-100 text-amber-700',
  RAPPORT_REÇU: 'bg-cyan-100 text-cyan-700',
  CATEGORISEE: 'bg-green-100 text-green-700',
  TERMINEE: 'bg-emerald-100 text-emerald-700',
}

export function QuoteStatusBadge({ status }: { status: QuoteRequestStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${QUOTE_STATUS_COLORS[status]}`}>
      {QUOTE_STATUS_LABELS[status]}
    </span>
  )
}

const CATEGORY_COLORS: Record<EquipmentCategory, string> = {
  A: 'bg-emerald-200 text-emerald-800',
  B: 'bg-blue-200 text-blue-800',
  C: 'bg-yellow-200 text-yellow-800',
  D: 'bg-orange-200 text-orange-800',
  E: 'bg-red-200 text-red-800',
}

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  A: 'Excellent',
  B: 'Bon',
  C: 'Moyen',
  D: 'À surveiller',
  E: 'Non recommandé',
}

export function CategoryBadge({ category }: { category: EquipmentCategory | null }) {
  if (!category) return null
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${CATEGORY_COLORS[category]}`}>
      {category} — {CATEGORY_LABELS[category]}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
}

export function StatCard({ label, value, accent = 'text-blue-700' }: { label: string; value: ReactNode; accent?: string }) {
  return (
    <Card className="p-4">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="mt-1 text-sm text-slate-700">{label}</div>
    </Card>
  )
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="text-3xl">📭</div>
      <div className="mt-2 font-semibold text-slate-700">{title}</div>
      {subtitle && <div className="mt-1 text-sm text-slate-700">{subtitle}</div>}
    </div>
  )
}

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-700">{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${value}%` }} />
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-600">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
      {message}
    </div>
  )
}
