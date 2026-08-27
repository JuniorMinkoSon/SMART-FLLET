import { useFleetStore } from '@/store/fleetStore'
import { AlertSeverity } from '@/types'

const SEV_ORDER: AlertSeverity[] = ['urgent', 'attention', 'info']
const SEV_META: Record<AlertSeverity, { icon: string; label: string }> = {
  urgent: { icon: '🔴', label: 'URGENT' },
  attention: { icon: '🟠', label: 'ATTENTION' },
  info: { icon: '🟡', label: 'INFO' },
}

export function Alertes() {
  const alerts = useFleetStore((s) => s.alerts)

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔔 Alertes ({alerts.length})</h1>
          <p className="page-subtitle">Toutes les alertes du parc, par niveau de priorité</p>
        </div>
      </div>

      {SEV_ORDER.map((sev) => {
        const items = alerts.filter((a) => a.severity === sev)
        if (!items.length) return null
        return (
          <div className="card section" key={sev}>
            <div className="card-title">
              {SEV_META[sev].icon} {SEV_META[sev].label}
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
