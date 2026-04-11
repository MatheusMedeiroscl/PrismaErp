// src/pages/Home.tsx
import { useEffect, useState } from 'react'
import { Sidebar } from '../components/SideBar'
import { useAuth } from '../shared/context/AuthContext'
import { Service } from '../shared/services/Service'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import '../style/Dashboard.css'

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

const STATUS_COLOR: Record<string, string> = {
  'Recebido': '#22c55e',
  'A Receber': '#f59e0b',
  'Pendente': '#3b82f6',
  'Cancelado': '#ef4444',
}

export function Home() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    Service.GetDashboard().then(setData)
  }, [])

  function formatCurrency(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  if (!data) return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content"><p className="loading-text">Carregando...</p></main>
    </div>
  )

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <div className="page-header">
          <h1 className="page-title">Home</h1>
        </div>

        <div className="dashboard-inner">
          {/* Welcome + KPIs */}
          <div className="dashboard-top">
            <div className="welcome-card">
              <div className="welcome-header">
                <div>
                  <p className="welcome-greeting">Seja Bem vinda, {user?.name} 🔥</p>
                </div>
                <button className="btn-primary">+ Novo Registro ▾</button>
              </div>

              <div className="kpi-row">
                <div className="kpi-item">
                  <span className="kpi-label">Estoque Atual</span>
                  <span className="kpi-value">{formatCurrency(data.totalRevenue)}</span>
                </div>
                <div className="kpi-item">
                  <span className="kpi-label">Vendas Mês</span>
                  <span className="kpi-value">{formatCurrency(data.monthlySales)}</span>
                </div>
                <div className="kpi-item">
                  <span className="kpi-label">Clientes Ativos</span>
                  <span className="kpi-value">{data.activeClients}/{data.totalStock}</span>
                </div>
                <div className="kpi-item">
                  <span className="kpi-label">X.range</span>
                  <span className="kpi-value">{formatCurrency(13500)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts row */}
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
                  <Bar dataKey="stock" name="Estoque" fill="#6366f1" radius={[3,3,0,0]} />
                  <Bar dataKey="demand" name="Demanda" fill="#a5b4fc" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tables row */}
          <div className="tables-row">
            <div className="table-card">
              <h3 className="chart-title">Vendas Recentes</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Venda</th>
                    <th>Status</th>
                    <th>Cliente</th>
                    <th>Total R$</th>
                    <th>Pagamento</th>
                    <th>Vendedor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSales.map((sale, i) => (
                    <tr key={i}>
                      <td>{sale.id}</td>
                      <td>
                        <span className="status-badge" style={{ background: STATUS_COLOR[sale.status] + '22', color: STATUS_COLOR[sale.status] }}>
                          {sale.status}
                        </span>
                      </td>
                      <td>{sale.client}</td>
                      <td>{formatCurrency(sale.total)}</td>
                      <td>{sale.payment}</td>
                      <td>{sale.seller}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-card">
              <h3 className="chart-title">Produtos com mais Entradas</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Produto</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{p.name}</td>
                      <td>{formatCurrency(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}