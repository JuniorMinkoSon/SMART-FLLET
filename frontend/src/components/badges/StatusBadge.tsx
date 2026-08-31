import { CheckCircle2, Clock3, Zap, AlertCircle, XCircle, Pause } from 'lucide-react'
import './StatusBadge.css'

type StatusType = 'disponible' | 'affectee' | 'en_cours' | 'controle' | 'cloturee' | 'maintenance' | 'reserve'

const STATUS_CONFIG: Record<StatusType, { label: string; color: 'success' | 'info' | 'warning' | 'danger' | 'neutral'; Icon: any }> = {
  disponible: { label: 'Disponible', color: 'success', Icon: CheckCircle2 },
  affectee: { label: 'Affectée', color: 'info', Icon: Clock3 },
  en_cours: { label: 'En cours', color: 'warning', Icon: Zap },
  controle: { label: 'En contrôle', color: 'warning', Icon: AlertCircle },
  cloturee: { label: 'Clôturée', color: 'neutral', Icon: XCircle },
  maintenance: { label: 'Maintenance', color: 'danger', Icon: Pause },
  reserve: { label: 'Réservé', color: 'info', Icon: Clock3 },
}

export function StatusBadge({ status }: { status: StatusType }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.Icon

  return (
    <div className={`status-badge status-${config.color}`}>
      <Icon size={14} className="status-icon" />
      <span className="status-label">{config.label}</span>
    </div>
  )
}
