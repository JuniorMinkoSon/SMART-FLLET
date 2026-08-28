import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle, StatusBadge, Toast } from '../../components/ui'
import type { CheckResult, ChecklistItem } from '../../store/types'

const RESULT_OPTIONS: { value: CheckResult; label: string; cls: string }[] = [
  { value: 'CONFORME', label: 'Conforme', cls: 'bg-emerald-600 text-white' },
  { value: 'A_SURVEILLER', label: 'À surveiller', cls: 'bg-amber-500 text-white' },
  { value: 'NON_CONFORME', label: 'Non conforme', cls: 'bg-red-600 text-white' },
]

export default function TechnicalInspection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { inspections, equipment, startInspection, updateChecklist, submitReport } = useStore()
  const inspection = inspections.find((i) => i.id === id)
  const eq = equipment.find((e) => e.id === inspection?.equipmentId)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(inspection?.checklist ?? [])
  const [observations, setObservations] = useState('')
  const [photos, setPhotos] = useState<string[]>(inspection?.photos ?? [])
  const [measures, setMeasures] = useState<string[]>([])
  const [anomalies, setAnomalies] = useState<string[]>(inspection?.anomalies ?? [])
  const [toast, setToast] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  if (!inspection || !eq) {
    return (
      <div>
        <EmptyState title="Inspection introuvable" />
        <div className="mt-4">
          <Link to="/technical/missions" className="font-medium text-blue-600 hover:underline">← Retour aux missions</Link>
        </div>
      </div>
    )
  }

  const done = inspection.status === 'TERMINEE' || inspection.status === 'DONE'
  const filled = checklist.filter((c) => c.result !== null).length
  const complete = filled === checklist.length

  const setResult = (index: number, result: CheckResult) => {
    const next = checklist.map((c, i) => (i === index ? { ...c, result } : c))
    setChecklist(next)
    updateChecklist(inspection.id, next)
    if (inspection.status === 'ASSIGNEE' || inspection.status === 'ASSIGNED') startInspection(inspection.id)
  }

  const sections = [...new Set(checklist.map((c) => c.section))]

  const submit = () => {
    setSending(true)
    setTimeout(() => {
      submitReport(
        inspection.id,
        observations || 'Inspection réalisée. Voir la checklist détaillée.',
        checklist,
      )
      setSending(false)
      setToast('Rapport soumis à VOLTA ✔ L\'engin passe en attente de décision admin.')
      setTimeout(() => navigate('/technical/missions'), 1500)
    }, 600)
  }

  return (
    <div className="max-w-4xl">
      <Link to="/technical/missions" className="text-sm font-medium text-blue-600 hover:underline">← Retour aux missions</Link>
      <div className="mt-2">
        <PageTitle
          title={`Inspection — ${eq.name}`}
          subtitle={`${eq.brand} ${eq.model} · ${eq.year} · ${eq.location}`}
          actions={<StatusBadge status={eq.status} />}
        />
      </div>

      {done ? (
        <Card className="p-6">
          <div className="font-semibold text-emerald-700">✔ Rapport déjà soumis pour cette mission.</div>
          <p className="mt-2 text-sm text-slate-600">L'engin est en attente de décision de l'administrateur VOLTA.</p>
        </Card>
      ) : (
        <>
          <Card className="mb-4 flex items-center justify-between p-4 text-sm">
            <span className="font-medium">Progression de la checklist</span>
            <span className="font-bold text-blue-700">{filled} / {checklist.length} contrôles</span>
          </Card>

          {sections.map((section) => (
            <Card key={section} className="mb-4 p-5">
              <h3 className="mb-3 font-bold text-slate-800">{section}</h3>
              <div className="divide-y divide-slate-100">
                {checklist.map((c, i) =>
                  c.section !== section ? null : (
                    <div key={c.label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <span className="text-sm font-medium">{c.label}</span>
                      <div className="flex gap-1.5">
                        {RESULT_OPTIONS.map((o) => (
                          <button
                            key={o.value}
                            onClick={() => setResult(i, o.value)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                              c.result === o.value ? o.cls : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Card>
          ))}

          <Card className="mb-4 grid gap-4 p-5">
            <h3 className="font-bold">Observations & preuves</h3>
            <textarea
              className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              rows={3}
              placeholder="Observations générales…"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPhotos((p) => [...p, `https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=320&q=70&t=${Date.now()}`])}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium hover:bg-slate-200"
              >
                + Photo (mock)
              </button>
              <button
                onClick={() => setMeasures((m) => [...m, `Pression hydraulique : ${(300 + m.length * 5)} bar`])}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium hover:bg-slate-200"
              >
                + Mesure (mock)
              </button>
              <button
                onClick={() => setAnomalies((a) => [...a, `Anomalie mineure détectée #${a.length + 1}`])}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium hover:bg-slate-200"
              >
                + Anomalie (mock)
              </button>
            </div>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <img key={i} src={p} alt="" className="h-16 w-24 rounded-lg object-cover" />
                ))}
              </div>
            )}
            {(measures.length > 0 || anomalies.length > 0) && (
              <ul className="list-inside list-disc text-sm text-slate-600">
                {measures.map((m, i) => (
                  <li key={`m-${i}`}>📏 {m}</li>
                ))}
                {anomalies.map((a, i) => (
                  <li key={`a-${i}`} className="text-red-600">⚠️ {a}</li>
                ))}
              </ul>
            )}
          </Card>

          <button
            onClick={submit}
            disabled={!complete || sending}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? 'Envoi du rapport…' : complete ? 'Soumettre le rapport' : `Compléter la checklist (${filled}/${checklist.length})`}
          </button>
        </>
      )}
      <Toast message={toast} />
    </div>
  )
}
