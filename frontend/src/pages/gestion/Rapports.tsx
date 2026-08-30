import { useMemo, useState } from 'react'
import { useFleetStore } from '@/store/fleetStore'
import { Download, FileText, Printer } from 'lucide-react'
import {
  MISSION_STATUS_LABELS,
  VEHICLE_STATUS_LABELS,
} from '@/types'

type ReportType = 'global' | 'flotte' | 'missions' | 'carburant' | 'depenses'

const REPORT_LABELS: Record<ReportType, string> = {
  global: 'Rapport global du parc',
  flotte: 'Rapport flotte',
  missions: 'Rapport missions',
  carburant: 'Rapport carburant',
  depenses: 'Rapport dépenses',
}

interface ReportTable {
  headers: string[]
  rows: (string | number)[][]
}

function csvEscape(value: string | number): string {
  const s = String(value)
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function downloadCsv(filename: string, table: ReportTable) {
  const lines = [table.headers, ...table.rows].map((r) => r.map(csvEscape).join(';'))
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function openPrintablePdf(title: string, table: ReportTable) {
  const win = window.open('', '_blank')
  if (!win) return
  const logoUrl = `${window.location.origin}/logo-smartfleet.png`
  const date = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${title} — Smart Fleet</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1d29; margin: 32px; }
  .head { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #f5a300; padding-bottom: 14px; }
  .head img { height: 48px; }
  .head h1 { font-size: 20px; margin: 0; }
  .head .sub { color: #6b7280; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
  th { background: #101528; color: #fff; text-align: left; padding: 8px 10px; }
  td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f8f9fb; }
  .foot { margin-top: 24px; color: #6b7280; font-size: 11px; text-align: center; }
</style>
</head>
<body>
  <div class="head">
    <img src="${logoUrl}" alt="Smart Fleet" />
    <div>
      <h1>${title}</h1>
      <div class="sub">Smart Fleet — Génie Sélect · Généré le ${date}</div>
    </div>
  </div>
  <table>
    <thead><tr>${table.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${table.rows
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
      .join('')}</tbody>
  </table>
  <div class="foot">Document généré par Smart Fleet — gestion de flotte Génie Sélect / LocaConnecté</div>
  <script>window.onload = function () { window.print() }</script>
</body>
</html>`)
  win.document.close()
}

export function Rapports() {
  const { vehicles, drivers, missions, fuelEntries, expenses } = useFleetStore()
  const [type, setType] = useState<ReportType>('global')

  const table = useMemo<ReportTable>(() => {
    switch (type) {
      case 'flotte':
        return {
          headers: ['Code', 'Type', 'Nom', 'Immatriculation', 'Statut', 'Km', 'Heures moteur', 'Carburant (%)', 'État'],
          rows: vehicles.map((v) => [
            v.code,
            v.type,
            v.name,
            v.plate,
            VEHICLE_STATUS_LABELS[v.status],
            v.km,
            v.engineHours,
            v.fuelLevel,
            v.condition,
          ]),
        }
      case 'missions':
        return {
          headers: ['Code', 'Chantier', 'Client', 'Engin', 'Conducteur', 'Début', 'Fin', 'Budget (FCFA)', 'Statut'],
          rows: missions.map((m) => [
            m.code,
            m.site,
            m.client ?? '-',
            vehicles.find((v) => v.id === m.vehicleId)?.code ?? m.vehicleId,
            drivers.find((d) => d.id === m.driverId)?.name ?? m.driverId,
            m.startDate,
            m.endDate,
            m.budget.toLocaleString('fr-FR'),
            MISSION_STATUS_LABELS[m.status],
          ]),
        }
      case 'carburant':
        return {
          headers: ['Date', 'Engin', 'Mission', 'Litres', 'Montant (FCFA)', 'Station', 'Km'],
          rows: fuelEntries.map((f) => [
            f.date,
            vehicles.find((v) => v.id === f.vehicleId)?.code ?? f.vehicleId,
            f.missionId ?? '-',
            f.liters,
            f.amount.toLocaleString('fr-FR'),
            f.station ?? '-',
            f.km ?? '-',
          ]),
        }
      case 'depenses':
        return {
          headers: ['Date', 'Catégorie', 'Libellé', 'Engin', 'Mission', 'Montant (FCFA)'],
          rows: expenses.map((e) => [
            e.date,
            e.category,
            e.label,
            e.vehicleId ? vehicles.find((v) => v.id === e.vehicleId)?.code ?? e.vehicleId : '-',
            e.missionId ?? '-',
            e.amount.toLocaleString('fr-FR'),
          ]),
        }
      default: {
        const totalFuel = fuelEntries.reduce((s, f) => s + f.amount, 0)
        const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
        return {
          headers: ['Indicateur', 'Valeur'],
          rows: [
            ['Engins total', vehicles.length],
            ['Engins disponibles', vehicles.filter((v) => v.status === 'disponible').length],
            ['Engins en mission', vehicles.filter((v) => v.status === 'en_mission').length],
            ['Engins en maintenance', vehicles.filter((v) => v.status === 'maintenance').length],
            ['Conducteurs', drivers.length],
            ['Missions total', missions.length],
            ['Missions en cours', missions.filter((m) => m.status === 'en_cours').length],
            ['Missions clôturées', missions.filter((m) => m.status === 'cloturee').length],
            ['Dépenses carburant (FCFA)', totalFuel.toLocaleString('fr-FR')],
            ['Dépenses totales (FCFA)', totalExpenses.toLocaleString('fr-FR')],
          ],
        }
      }
    }
  }, [type, vehicles, drivers, missions, fuelEntries, expenses])

  const title = REPORT_LABELS[type]
  const slug = `rapport-${type}-${new Date().toISOString().slice(0, 10)}`

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ minWidth: 260 }}>
            <label className="small strong muted" htmlFor="report-type">Type de rapport</label>
            <select
              id="report-type"
              value={type}
              onChange={(e) => setType(e.target.value as ReportType)}
              style={{ width: '100%' }}
            >
              {(Object.keys(REPORT_LABELS) as ReportType[]).map((t) => (
                <option key={t} value={t}>{REPORT_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => downloadCsv(`${slug}.csv`, table)}>
            <Download size={16} /> Télécharger CSV
          </button>
          <button className="btn btn-secondary" onClick={() => openPrintablePdf(title, table)}>
            <Printer size={16} /> Exporter PDF
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FileText size={18} />
          <span className="strong">{title}</span>
          <span className="muted small">{table.rows.length} lignes</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>{table.headers.map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
