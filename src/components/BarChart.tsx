// src/components/BarChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface IBarChartData {
  label: string
  value: number
}

interface IBarChartProps {
  data: IBarChartData[]
  title?: string
  color?: string
  xLabel?: string
  yLabel?: string
  height?: number
}

export function BarChartCard({ data, title, color = '#6366f1', height = 200 }: IBarChartProps) {
  return (
    <div className="table-card" style={{ padding: 16 }}>
      {title && <h3 className="chart-title" style={{ marginBottom: 12 }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barSize={32}>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            formatter={(value: number) => [value, 'Vendas']}
            cursor={{ fill: color + '11' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}