import { ReactNode } from 'react'
import {
  VehicleStatus,
  MissionStatus,
  VEHICLE_STATUS_LABELS,
  MISSION_STATUS_LABELS,
  Driver,
} from '@/types'

export function StatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="dot" />
      {VEHICLE_STATUS_LABELS[status]}
    </span>
  )
}

export function MissionBadge({ status }: { status: MissionStatus }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="dot" />
      {MISSION_STATUS_LABELS[status]}
    </span>
  )
}

export function DriverBadge({ status }: { status: Driver['status'] }) {
  const labels = {
    disponible: 'Disponible',
    reserve: 'Réservé',
    en_mission: 'En mission',
    indisponible: 'Indisponible',
  }
  return (
    <span className={`badge badge-${status}`}>
      <span className="dot" />
      {labels[status]}
    </span>
  )
}

export function KPICard({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="card">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  )
}

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
      <div className="drawer" role="dialog" aria-label={title}>
        <div className="drawer-header">
          <div className="drawer-title">{title}</div>
          <button className="close-btn" onClick={onClose} aria-label="Fermer">
            ✕
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
      <div className="modal" role="dialog" aria-label={title}>
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

export function EmptyState({ message }: { message: string }) {
  return <div className="empty-state">{message}</div>
}
