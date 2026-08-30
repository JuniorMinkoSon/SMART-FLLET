import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface FleetChartProps {
  data: { status: string; count: number }[]
}

export function FleetChart({ data }: FleetChartProps) {
  const chartData = {
    labels: data.map(d => d.status),
    datasets: [
      {
        label: 'Engins',
        data: data.map(d => d.count),
        backgroundColor: 'var(--primary)',
        borderColor: 'var(--primary)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  }

  return (
    <div style={{ width: '100%', height: 300, position: 'relative' }}>
      <Bar data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }} />
    </div>
  )
}
