import { useState, useRef } from 'react'
import { StatCard } from '@/components/cards/StatCard'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, TrendingUp, DollarSign, Fuel, Wrench } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './DepensesProfessional.css'

interface ExpenseData {
  month: string
  carburant: number
  maintenance: number
  operations: number
}

interface ExpenseByType {
  name: string
  value: number
  color: string
}

export function DepensesProfessional() {
  const [expenses, setExpenses] = useState<ExpenseData[]>([
    { month: 'Jan', carburant: 45000, maintenance: 12000, operations: 8000 },
    { month: 'Fév', carburant: 52000, maintenance: 18000, operations: 9000 },
    { month: 'Mar', carburant: 48000, maintenance: 15000, operations: 7000 },
    { month: 'Avr', carburant: 55000, maintenance: 20000, operations: 10000 },
    { month: 'Mai', carburant: 51000, maintenance: 14000, operations: 8500 },
    { month: 'Juin', carburant: 58000, maintenance: 22000, operations: 11000 },
  ])

  const expenseByType: ExpenseByType[] = [
    { name: 'Carburant', value: 309000, color: '#0066cc' },
    { name: 'Maintenance', value: 101000, color: '#10b981' },
    { name: 'Opérations', value: 53500, color: '#f59e0b' },
  ]

  const totalExpense = expenseByType.reduce((sum, item) => sum + item.value, 0)
  const avgMonthly = totalExpense / 6
  const maxMonth = Math.max(...expenses.map(e => e.carburant + e.maintenance + e.operations))

  const stats = [
    { title: 'Total (6 mois)', value: `${(totalExpense / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'blue' },
    { title: 'Moy. mensuelle', value: `${(avgMonthly / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'green' },
    { title: 'Carburant', value: `${(309000 / 1000).toFixed(0)}K`, icon: Fuel, color: 'orange' },
    { title: 'Maintenance', value: `${(101000 / 1000).toFixed(0)}K`, icon: Wrench, color: 'red' },
  ]

  const pdfRef = useRef<HTMLDivElement>(null)

  const downloadReport = async () => {
    if (!pdfRef.current) return

    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.text('SmartFleet - Rapport Dépenses', 105, 15, { align: 'center' })
      pdf.setFontSize(10)
      pdf.text(`Généré le: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' })

      position = 30
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 277

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= 277
      }

      pdf.save(`depenses_smartfleet_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
    }
  }

  return (
    <div ref={pdfRef} className="depenses-professional">
      {/* HEADER */}
      <div className="depenses-header">
        <div>
          <h2 className="header-title">Gestion des Dépenses</h2>
          <p className="header-subtitle">Suivi budget flotte - 6 derniers mois</p>
        </div>
        <button className="btn btn-primary" onClick={downloadReport}>
          <Download size={18} />
          Télécharger Récap
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            Icon={stat.icon}
            color={stat.color as any}
          />
        ))}
      </div>

      {/* CHARTS */}
      <div className="charts-grid">
        {/* Graphique en barres */}
        <div className="card chart-card">
          <h3 className="chart-title">Dépenses par Type & Mois</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${(value / 1000).toFixed(0)}K`} />
              <Legend />
              <Bar dataKey="carburant" name="Carburant" fill="#0066cc" />
              <Bar dataKey="maintenance" name="Maintenance" fill="#10b981" />
              <Bar dataKey="operations" name="Opérations" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Camembert */}
        <div className="card chart-card">
          <h3 className="chart-title">Répartition des Dépenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${((value / totalExpense) * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${(value / 1000).toFixed(0)}K`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COURBE MENSUELLE */}
      <div className="card">
        <h3 className="chart-title">Tendance Mensuelle</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={expenses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `${(value / 1000).toFixed(0)}K`} />
            <Legend />
            <Line type="monotone" dataKey="carburant" stroke="#0066cc" name="Carburant" />
            <Line type="monotone" dataKey="maintenance" stroke="#10b981" name="Maintenance" />
            <Line type="monotone" dataKey="operations" stroke="#f59e0b" name="Opérations" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* TABLEAU DÉTAIL */}
      <div className="card">
        <h3 className="chart-title">Détail Mensuel</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mois</th>
                <th>Carburant</th>
                <th>Maintenance</th>
                <th>Opérations</th>
                <th>Total</th>
                <th>Variation</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp, idx) => {
                const total = exp.carburant + exp.maintenance + exp.operations
                const prevTotal = idx > 0 ? expenses[idx - 1].carburant + expenses[idx - 1].maintenance + expenses[idx - 1].operations : total
                const variation = ((total - prevTotal) / prevTotal * 100).toFixed(1)
                return (
                  <tr key={idx}>
                    <td className="font-semibold">{exp.month}</td>
                    <td>{(exp.carburant / 1000).toFixed(0)}K</td>
                    <td>{(exp.maintenance / 1000).toFixed(0)}K</td>
                    <td>{(exp.operations / 1000).toFixed(0)}K</td>
                    <td className="font-semibold">{(total / 1000).toFixed(0)}K</td>
                    <td className={`variation ${idx === 0 ? '' : parseFloat(variation) > 0 ? 'negative' : 'positive'}`}>
                      {idx === 0 ? '-' : parseFloat(variation) > 0 ? `+${variation}%` : `${variation}%`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
