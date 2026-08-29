import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { VehicleStatus } from '@/types'

interface FleetChartProps {
  data: { status: string; count: number }[]
}

export function FleetChart({ data }: FleetChartProps) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="var(--primary)" name="Engins" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
