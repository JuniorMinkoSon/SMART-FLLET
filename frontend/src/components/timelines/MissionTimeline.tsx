import { CheckCircle2, Clock3, Circle } from 'lucide-react'
import './MissionTimeline.css'

interface TimelineStep {
  status: 'disponible' | 'affectee' | 'en_cours' | 'controle' | 'cloturee'
  label: string
  timestamp?: string
  completed: boolean
}

const STEPS: TimelineStep[] = [
  { status: 'disponible', label: 'Créée', completed: false },
  { status: 'affectee', label: 'Conducteur affecté', completed: false },
  { status: 'en_cours', label: 'Départ', completed: false },
  { status: 'controle', label: 'Retour', completed: false },
  { status: 'cloturee', label: 'Clôture', completed: false },
]

interface MissionTimelineProps {
  currentStatus: 'disponible' | 'affectee' | 'en_cours' | 'controle' | 'cloturee'
  events?: Array<{ status: string; timestamp: string }>
}

export function MissionTimeline({ currentStatus, events = [] }: MissionTimelineProps) {
  const statusOrder = ['disponible', 'affectee', 'en_cours', 'controle', 'cloturee']
  const currentIndex = statusOrder.indexOf(currentStatus)

  const steps = STEPS.map((step, idx) => ({
    ...step,
    completed: idx <= currentIndex,
    timestamp: events.find(e => e.status === step.status)?.timestamp,
  }))

  return (
    <div className="mission-timeline">
      {steps.map((step, idx) => (
        <div key={step.status} className="timeline-item">
          <div className={`timeline-marker ${step.completed ? 'completed' : 'pending'}`}>
            {step.completed && idx < currentIndex ? (
              <CheckCircle2 size={20} />
            ) : idx === currentIndex ? (
              <Clock3 size={20} className="animate-pulse" />
            ) : (
              <Circle size={20} />
            )}
          </div>
          <div className="timeline-content">
            <div className="timeline-label">{step.label}</div>
            {step.timestamp && (
              <div className="timeline-timestamp">{step.timestamp}</div>
            )}
          </div>
          {idx < steps.length - 1 && (
            <div className={`timeline-line ${step.completed ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}
