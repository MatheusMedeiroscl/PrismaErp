import './styles/kpi.css'

interface KpiCardProps {
  label: string
  value: string | any
  className?: string
}

export function KpiCard({ className, label, value }: KpiCardProps) {
  return (
    <div className={className ?? 'kpi-item'}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
    </div>
  )
}