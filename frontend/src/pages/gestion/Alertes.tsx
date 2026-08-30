import { useFleetStore } from '@/store/fleetStore'
import { AlertSeverity } from '@/types'
import { AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react'

const SEV_ORDER: AlertSeverity[] = ['urgent', 'attention', 'info']
const SEV_META: Record<AlertSeverity, { Icon: any; label: string }> = {
  urgent: { Icon: AlertCircle, label: 'URGENT' },
  attention: { Icon: AlertTriangle, label: 'ATTENTION' },
  info: { Icon: Info, label: 'INFO' },
}

export function Alertes() {
  const alerts = useFleetStore((s) => s.alerts)

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={24} /> Alertes ({alerts.length})
          </h1>
          <p className="page-subtitle">Toutes les alertes du parc, par niveau de priorité</p>
        </div>
      </div>

      {SEV_ORDER.map((sev) => {
        const items = alerts.filter((a) => a.severity === sev)
        if (!items.length) return null
        const Meta = SEV_META[sev]
        return (
          <div className="card section" key={sev}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Meta.Icon size={20} color={sev === 'urgent' ? 'var(--red)' : sev === 'attention' ? 'var(--orange)' : 'var(--yellow)'} />
              {Meta.label}
            </div>
            {items.map((a) => (
              <div className="alert-item" key={a.id}>
                <div style={{ flex: 1 }}>
                  <div className="strong">{a.title}</div>
                  <div className="muted small">{a.detail}</div>
                  <div className="small" style={{ color: 'var(--text-3)', marginTop: 4 }}>
                    {a.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
