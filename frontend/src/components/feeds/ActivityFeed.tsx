import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertCircle, CheckCircle2, Clock3, Edit2, Trash2 } from 'lucide-react'
import './ActivityFeed.css'

interface Activity {
  id: string
  action: string
  user: string
  entity: string
  timestamp: Date
  type: 'create' | 'update' | 'delete' | 'action'
}

interface ActivityFeedProps {
  activities: Activity[]
  limit?: number
}

const ACTION_ICONS = {
  create: CheckCircle2,
  update: Edit2,
  delete: Trash2,
  action: Clock3,
}

export function ActivityFeed({ activities, limit = 10 }: ActivityFeedProps) {
  const displayed = activities.slice(0, limit)

  if (displayed.length === 0) {
    return <div className="empty-activity">Aucune activité</div>
  }

  return (
    <div className="activity-feed">
      {displayed.map((activity) => {
        const Icon = ACTION_ICONS[activity.type]
        return (
          <div key={activity.id} className={`activity-item activity-${activity.type}`}>
            <div className="activity-icon">
              <Icon size={16} />
            </div>
            <div className="activity-content">
              <div className="activity-text">
                <span className="activity-user">{activity.user}</span>
                <span className="activity-action">{activity.action}</span>
                <span className="activity-entity">{activity.entity}</span>
              </div>
              <div className="activity-time">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: fr })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
