// src/components/BarChart.tsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, Legend,
  type TooltipProps
} from 'recharts'
import { formatCurrency } from '../shared/utils/Format'

export interface IBarSeries {
  dataKey: string
  label: string
  color: string
  format?: 'currency' | 'number'
}

export interface IBarChartData {
  label: string
  [key: string]: string | number
}

interface IBarChartProps {
  data: IBarChartData[]
  series: IBarSeries[]
  title?: string
  height?: number
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6, color: '#111' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name}:{' '}
          <strong>
            {entry.payload[`__format_${entry.dataKey}`] === 'currency'
              ? formatCurrency(entry.value ?? 0)
              : entry.value}
          </strong>
        </p>
      ))}
    </div>
  )
}

export function BarChartCard({ data, series, title, height = 220 }: IBarChartProps) {
  // injeta o formato em cada linha de dado para o tooltip acessar
  const enrichedData = data.map(row => {
    const extra: Record<string, string> = {}
    series.forEach(s => {
      extra[`__format_${s.dataKey}`] = s.format ?? 'number'
    })
    return { ...row, ...extra }
  })

  return (
    <div className="table-card" style={{ padding: 16 }}>
      {title && <h3 className="chart-title" style={{ marginBottom: 12 }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={enrichedData} barSize={24} barGap={4}>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
          <Legend
            formatter={(value) => series.find(s => s.dataKey === value)?.label ?? value}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          {series.map((s) => (
            <Bar key={s.dataKey} dataKey={s.dataKey} name={s.label} radius={[4, 4, 0, 0]}>
              {enrichedData.map((_, i) => (
                <Cell key={i} fill={s.color} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}