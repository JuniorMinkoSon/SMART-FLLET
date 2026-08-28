import { useState } from 'react'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, Modal, PageTitle, StatusBadge } from '../../components/ui'

const RESULT_LABEL = {
  CONFORME: { label: 'Conforme', cls: 'text-emerald-600' },
  A_SURVEILLER: { label: 'À surveiller', cls: 'text-amber-600' },
  NON_CONFORME: { label: 'Non conforme', cls: 'text-red-600' },
} as const

export default function AdminReports() {
  const { reports, equipment, inspections, users } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const report = reports.find((r) => r.id === openId)
  const reportEq = report ? equipment.find((e) => e.id === report.equipmentId) : undefined

  return (
    <div>
      <PageTitle title="Rapports" subtitle="Rapports d'inspection transmis par les équipes techniques." />
      {reports.length === 0 ? (
        <EmptyState title="Aucun rapport" subtitle="Les rapports soumis apparaîtront ici." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-700">
              <tr>
                <th className="px-4 py-3">Engin</th>
                <th className="px-4 py-3">Équipe technique</th>
                <th className="px-4 py-3">Soumis le</th>
                <th className="px-4 py-3">Statut engin</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((r) => {
                const eq = equipment.find((e) => e.id === r.equipmentId)
                const insp = inspections.find((i) => i.id === r.inspectionId)
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium">{eq?.name}</td>
                    <td className="px-4 py-3">{users.find((u) => u.id === insp?.technicalTeamId)?.company}</td>
                    <td className="px-4 py-3">{r.submittedAt}</td>
                    <td className="px-4 py-3">{eq && <StatusBadge status={eq.status} />}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setOpenId(r.id)} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                        Consulter
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={!!report} onClose={() => setOpenId(null)} title={`Rapport — ${reportEq?.name ?? ''}`}>
        {report && (
          <div className="grid max-h-[70vh] gap-3 overflow-y-auto">
            <p className="text-sm text-slate-600">{report.summary}</p>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {report.checklist.map((c) => (
                <div key={`${c.section}-${c.label}`} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>
                    <span className="text-xs text-slate-600">{c.section} · </span>
                    {c.label}
                  </span>
                  {c.result && <span className={`text-xs font-semibold ${RESULT_LABEL[c.result].cls}`}>{RESULT_LABEL[c.result].label}</span>}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600">
              Pour référencer ou refuser cet engin, ouvrez-le depuis la page Engins.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
