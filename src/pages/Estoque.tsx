// src/pages/Estoque.tsx
import { useEffect, useState } from 'react'
import { Sidebar } from '../components/SideBar'
import { Service } from '../shared/services/Service'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import '../style/Dashboard.css'

interface EstoqueData {
  products: any[]
  summary: {
    totalStock: number
    totalValue: number
    avgDays: number
    lowStockCount: number
    totalProducts: number
  }
  lowStock: any[]
  monthlyMovement: { month: string; entries: number; exits: number }[]
}

const URGENCY_COLOR: Record<string, string> = {
  'Zandir': '#ef4444',
  'zandir': '#ef4444',
  'low': '#f59e0b',
}

export function Estoque() {
  const [data, setData] = useState<EstoqueData | null>(null)

  useEffect(() => {
    Service.GetProducts().then(setData)
  }, [])

  function formatCurrency(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  function getUrgency(product: any) {
    const ratio = product.stock / product.minStock
    if (ratio < 0.5) return { label: 'Zandir', color: '#ef4444' }
    if (ratio < 1) return { label: 'Zandir', color: '#f59e0b' }
    return { label: 'Ok', color: '#22c55e' }
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
          <h1 className="page-title">Estoque</h1>
          <div className="header-actions">
            <button className="btn-secondary">≡ Filtros</button>
            <button className="btn-primary">+ Novo Registro ▾</button>
          </div>
        </div>

        <div className="dashboard-inner">
          {/* KPIs */}
          <div className="kpi-cards-row">
            <div className="kpi-card">
              <span className="kpi-card-label">Estoque Atual</span>
              <span className="kpi-card-value">{data.summary.totalStock.toLocaleString('pt-BR')}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Total Perdida</span>
              <span className="kpi-card-value">{formatCurrency(data.summary.totalValue)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Dias sem Cobertura</span>
              <span className="kpi-card-value">{data.summary.avgDays} dias</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Produtos sem Estoque</span>
              <span className="kpi-card-value">{data.summary.lowStockCount}/{data.summary.totalProducts}</span>
            </div>
          </div>

          {/* Chart + Low stock */}
          <div className="estoque-mid-row">
            <div className="chart-card wide">
              <h3 className="chart-title">Movimentação do mês</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.monthlyMovement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="entries" name="Entradas" fill="#6366f1" radius={[3,3,0,0]} />
                  <Bar dataKey="exits" name="Saídas" fill="#a5b4fc" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="table-card">
              <h3 className="chart-title">Alertas de Reposição</h3>
              <div className="alert-list">
                {data.lowStock.map((p, i) => {
                  const urgency = getUrgency(p)
                  return (
                    <div className="alert-item" key={i}>
                      <div className="alert-info">
                        <span className="alert-name">{p.name}</span>
                        <span className="alert-sub">Estoque: {p.stock} | Mínimo: {p.minStock}</span>
                      </div>
                      <span className="alert-badge" style={{ background: urgency.color + '22', color: urgency.color }}>
                        {urgency.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent activity table */}
          <div className="table-card full-width">
            <h3 className="chart-title">Atividades Recentes</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Estoque</th>
                  <th>Mínimo</th>
                  <th>Entradas</th>
                  <th>Saídas</th>
                  <th>Preço</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((p, i) => {
                  const urgency = getUrgency(p)
                  return (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{p.stock}</td>
                      <td>{p.minStock}</td>
                      <td className="text-success">+{p.entries}</td>
                      <td className="text-danger">-{p.exits}</td>
                      <td>{formatCurrency(p.price)}</td>
                      <td>
                        <span className="status-badge" style={{ background: urgency.color + '22', color: urgency.color }}>
                          {urgency.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}