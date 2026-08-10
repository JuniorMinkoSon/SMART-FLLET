import './AlertBanner.css'

interface AlertBannerProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  onClose?: () => void
}

export function AlertBanner({ type, title, message, onClose }: AlertBannerProps) {
  const icons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠',
    error: '❌'
  }

  return (
    <div className={`alert-banner alert-${type}`}>
      <span className="alert-icon">{icons[type]}</span>
      <div className="alert-content">
        <div className="alert-title">{title}</div>
        <div className="alert-message">{message}</div>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>×</button>
      )}
    </div>
  )
}
