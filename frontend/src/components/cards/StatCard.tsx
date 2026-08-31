import type { LucideIcon } from 'lucide-react'
import './StatCard.css'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  Icon?: LucideIcon
  color?: 'blue' | 'green' | 'orange' | 'red'
  trend?: { value: number; isPositive: boolean }
}

export function StatCard({ title, value, subtitle, Icon, color = 'blue', trend }: StatCardProps) {
  return (
    <div className={`stat-card stat-${color}`}>
      {Icon && <Icon size={24} className="stat-icon" />}
      <div className="stat-content">
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        {trend && (
          <div className={`stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  )
}
