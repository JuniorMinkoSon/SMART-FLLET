import { ReactNode } from 'react'
import { X, Inbox, AlertTriangle } from 'lucide-react'
import {
  VehicleStatus,
  MissionStatus,
  VEHICLE_STATUS_LABELS,
  MISSION_STATUS_LABELS,
  Driver,
} from '@/types'

/* -------------------------------------------------------------------------- */
/*  Badges de statut — une seule implémentation pour véhicules / missions /   */
/*  conducteurs. Toujours tolérante à une valeur inconnue.                    */
/* -------------------------------------------------------------------------- */

function Badge({ statusKey, label }: { statusKey: string; label: string }) {
  return (
    <span className={`badge badge-${statusKey}`}>
      <span className="dot" />
      {label}
    </span>
  )
}

export function StatusBadge({ status }: { status: VehicleStatus | string }) {
  const label = VEHICLE_STATUS_LABELS[status as VehicleStatus] ?? String(status)
  const key = VEHICLE_STATUS_LABELS[status as VehicleStatus] ? status : 'neutral'
  return <Badge statusKey={key} label={label} />
}

export function MissionBadge({ status }: { status: MissionStatus | string }) {
  const label = MISSION_STATUS_LABELS[status as MissionStatus] ?? String(status)
  const key = MISSION_STATUS_LABELS[status as MissionStatus] ? status : 'neutral'
  return <Badge statusKey={key} label={label} />
}

const DRIVER_STATUS_LABELS: Record<Driver['status'], string> = {
  disponible: 'Disponible',
  reserve: 'Réservé',
  en_mission: 'En mission',
  indisponible: 'Indisponible',
}

export function DriverBadge({ status }: { status: Driver['status'] | string }) {
  const label = DRIVER_STATUS_LABELS[status as Driver['status']] ?? String(status)
  const key = DRIVER_STATUS_LABELS[status as Driver['status']] ? status : 'neutral'
  return <Badge statusKey={key} label={label} />
}

/* -------------------------------------------------------------------------- */
/*  KPI                                                                       */
/* -------------------------------------------------------------------------- */

export function KPICard({
  value,
  label,
  hint,
}: {
  value: ReactNode
  label: string
  hint?: string
}) {
  return (
    <div className="card">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {hint && <div className="small muted" style={{ marginTop: 6 }}>{hint}</div>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Drawer / Modal                                                            */
/* -------------------------------------------------------------------------- */

interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  if (!open) return null
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-header">
          <div className="drawer-title">{title}</div>
          <button className="close-btn" onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </>
  )
}

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h3 style={{ marginBottom: 12 }}>{title}</h3>
        {children}
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            {footer}
          </div>
        )}
      </div>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*  États : vide / chargement / erreur                                        */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  message,
  title,
  action,
}: {
  message: string
  title?: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Inbox size={32} />
      </div>
      {title && <div className="empty-state-title">{title}</div>}
      <div className="empty-state-text">{message}</div>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

export function Loader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="state-block" role="status" aria-live="polite">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({
  message = "Une erreur est survenue lors du chargement.",
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="state-block error" role="alert">
      <AlertTriangle size={28} />
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  )
}
