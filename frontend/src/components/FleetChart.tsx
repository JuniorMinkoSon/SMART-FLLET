import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface FleetChartProps {
  data: { status: string; count: number }[]
}

/**
 * Lit une variable CSS du thème avec repli (les couleurs `var(--x)` ne sont
 * pas résolues dans le canvas Chart.js, il faut une vraie valeur).
 */
function cssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export function FleetChart({ data }: FleetChartProps) {
  const brand = cssVar('--brand', '#2563eb')
  const border = cssVar('--border', '#e3e8f0')
  const text = cssVar('--text-2', '#5b6b85')

  // Axe Y borné aux valeurs réelles (petits entiers) : évite que Chart.js
  // ajoute une marge et laisse une barre "à 3" flotter sous la ligne 3.
  const maxCount = Math.max(1, ...data.map((d) => d.count))
  const suggestedMax = maxCount <= 5 ? maxCount : Math.ceil(maxCount * 1.1)

  const chartData = {
    labels: data.map((d) => d.status),
    datasets: [
      {
        label: 'Engins',
        data: data.map((d) => d.count),
        backgroundColor: brand,
        borderColor: brand,
        borderWidth: 0,
        borderRadius: 6,
        maxBarThickness: 56,
      },
    ],
  }

  return (
    <div style={{ width: '100%', height: 300, position: 'relative' }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 250 },
          plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: { padding: 10 },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: text } },
            y: {
              beginAtZero: true,
              max: suggestedMax,
              ticks: { color: text, precision: 0, stepSize: 1 },
              grid: { color: border },
            },
          },
        }}
      />
    </div>
  )
}
