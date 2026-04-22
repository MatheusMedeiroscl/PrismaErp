// src/pages/Home.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '../shared/context/AuthContext'
import { Service } from '../shared/services/Service'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import '../style/Dashboard.css'
import { PageLayout } from '../shared/layout/PageLayout'
import { formatCurrency } from '../shared/utils/Format'
import { KpiCard } from '../components/Kpi'
import { STATUS_COLOR } from '../shared/utils/Colors'
import { FilterPopover } from '../components/Filter'

interface DashboardData {
  totalRevenue: number
  monthlySales: number
  activeClients: number
  totalStock: number
  salesPerformance: { month: string; value: number }[]
  stockVsDemand: { category: string; stock: number; demand: number }[]
  recentSales: any[]
  topProducts: any[]
}

const INITIAL_FILTER = { cliente: '', data: '' }

export function Home() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [filter, setFilter] = useState(INITIAL_FILTER)

  useEffect(() => {
    Service.GetDashboard().then(setData)
  }, [])

  const RecentSales = (data?.recentSales ?? []).filter(s => {
    const matchCliente = !filter.cliente || s.client.toLowerCase().includes(filter.cliente.toLowerCase())
    const matchData = !filter.data || s.date?.startsWith(filter.data)
    return matchCliente && matchData
  })

  const hasFilter = !!(filter.cliente || filter.data)

  if (!data) return (
    <>
      <PageLayout title=''><p className="loading-text">Carregando...</p></PageLayout>
    </>
  )


  const kpis = [
    { label: 'Estoque Atual', value: formatCurrency(data.totalRevenue) },
    { label: 'Vendas Mês', value: formatCurrency(data.monthlySales) },
    { label: 'Clientes Ativos', value: `${data.activeClients}/${data.totalStock}` },
    { label: 'X.range', value: formatCurrency(13500) },
  ]
  return (<>
      <PageLayout title='Dashboard'>
        <div className="dashboard-inner">
          <div className="welcome-card">
            <div className="welcome-header">
              <p className="welcome-greeting">Seja Bem vinda, {user?.name} 🔥</p>
            </div>
            <div className="kpi-row">
                  {kpis.map((kpi) =>(
                    <KpiCard key={kpi.label}  label={kpi.label} value={kpi.value}/>
                    )
                  )}
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-card">
              <h3 className="chart-title">Performance de Vendas</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.salesPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3 className="chart-title">Estoque Vs Demanda</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.stockVsDemand}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stock" name="Estoque" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="demand" name="Demanda" fill="#a5b4fc" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="table-card full-width">
            <div className="table-card-header">
              <h3 className="chart-title">Vendas Recentes</h3>
              <FilterPopover
                hasFilter={hasFilter}
                onClear={() => setFilter(INITIAL_FILTER)}
                fields={[
                  {
                    label: 'Cliente',
                    placeholder: 'Nome do Cliente',
                    value: filter.cliente,
                    onChange: v => setFilter(f => ({...f, cliente: v}))
                  },
                  {
                    label: 'Data',
                    type: 'date',
                    value: filter.data,
                    onChange: v => setFilter(f => ({...f, cliente: v}))
                  }
                ]}/>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Venda</th><th>Status</th><th>Cliente</th>
                  <th>Total R$</th><th>Pagamento</th><th>Vendedor</th>
                </tr>
              </thead>
              <tbody>
                {RecentSales.length === 0
                  ? <tr><td colSpan={6} className="empty-row">Nenhum resultado encontrado</td></tr>
                  : RecentSales.map((sale, i) => (
                    <tr key={i}>
                      <td>{sale.id}</td>
                      <td><span className="status-badge" style={{ background: STATUS_COLOR[sale.status] + '22', color: STATUS_COLOR[sale.status] }}>{sale.status}</span></td>
                      <td>{sale.client}</td>
                      <td>{formatCurrency(sale.total)}</td>
                      <td>{sale.payment}</td>
                      <td>{sale.seller}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            </div>
          </div>
      </PageLayout>
    </>)
}