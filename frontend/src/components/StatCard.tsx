import './StatCard.css'

interface StatCardProps {
  label: string
  value: number | string
  icon?: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

export function StatCard({ label, value, icon, color = 'primary' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      {icon && <span className="stat-icon">{icon}</span>}
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}
