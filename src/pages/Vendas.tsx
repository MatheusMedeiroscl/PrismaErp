// src/pages/Vendas.tsx
import { useEffect, useState } from 'react'
import { Sidebar } from '../components/SideBar'
import { Service } from '../shared/services/Service'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import '../style/Dashboard.css'

interface VendasData {
  sales: any[]
  summary: {
    total: number
    received: number
    pending: number
    cancelled: number
  }
}

const STATUS_COLOR: Record<string, string> = {
  'Recebido': '#22c55e',
  'A Receber': '#f59e0b',
  'Pendente': '#3b82f6',
  'Cancelado': '#ef4444',
}

export function Vendas() {
  const [data, setData] = useState<VendasData | null>(null)

  useEffect(() => {
    Service.GetSales().then(setData)
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

  const topProducts = [
    { name: 'Fruta Nutridelta', value: 1305.45 },
    { name: 'Rastos de Viteiro', value: 760.85 },
    { name: 'Mercado Kairo', value: 760.85 },
    { name: 'Palmito Tradicional', value: 825.60 },
  ]

  const statusSummary = [
    { label: 'Pix', value: data.sales.filter(s => s.payment === 'Pix').length, color: '#22c55e' },
    { label: 'Boleto', value: data.sales.filter(s => s.payment === 'Boleto').length, color: '#3b82f6' },
    { label: 'Dinheiro', value: data.sales.filter(s => s.payment === 'Dinheiro').length, color: '#f59e0b' },
    { label: 'Cancelado', value: data.sales.filter(s => s.status === 'Cancelado').length, color: '#ef4444' },
  ]

  const topClients = [
    { client: 'Mercado Dela Vitana', days: 30 },
    { client: 'Bachareira Rogério', days: 42 },
    { client: 'Mercado Kairo', days: 35 },
    { client: '#totalRoc', days: 18 },
    { client: 'Allister Dem', days: 17 },
  ]

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <div className="page-header">
          <h1 className="page-title">Vendas</h1>
          <div className="header-actions">
            <button className="btn-secondary">≡ Filtros</button>
            <button className="btn-primary">+ Novo Registro ▾</button>
          </div>
        </div>

        <div className="dashboard-inner">
          {/* KPIs */}
          <div className="kpi-cards-row">
            <div className="kpi-card">
              <span className="kpi-card-label">Total Recebido</span>
              <span className="kpi-card-value">{formatCurrency(data.summary.received || 7000)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Total Faturado</span>
              <span className="kpi-card-value">{formatCurrency(3000)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Total Relatório</span>
              <span className="kpi-card-value">{data.summary.pending}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Vendas no Período</span>
              <span className="kpi-card-value">{formatCurrency(14000)}</span>
            </div>
          </div>

          {/* Three columns */}
          <div className="vendas-mid-row">
            {/* Top clients */}
            <div className="table-card">
              <h3 className="chart-title">Clientes Inativos</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Dias Inativos</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((c, i) => (
                    <tr key={i}>
                      <td>{c.client}</td>
                      <td>{c.days} dias</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top products */}
            <div className="table-card">
              <h3 className="chart-title">Top Produtos Vendidos</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Produto</th>
                    <th>Total R$</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{p.name}</td>
                      <td>{formatCurrency(p.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Status summary chart */}
            <div className="chart-card">
              <h3 className="chart-title">Resumo por Status</h3>
              <div className="status-bar-list">
                {statusSummary.map((s, i) => (
                  <div className="status-bar-item" key={i}>
                    <div className="status-bar-header">
                      <span className="status-badge" style={{ background: s.color + '22', color: s.color }}>{s.label}</span>
                      <span className="status-bar-value">{s.value} vendas</span>
                    </div>
                    <div className="status-bar-track">
                      <div
                        className="status-bar-fill"
                        style={{
                          width: `${(s.value / data.sales.length) * 100}%`,
                          background: s.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={statusSummary} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0,4,4,0]}>
                      {statusSummary.map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent sales table */}
          <div className="table-card full-width">
            <h3 className="chart-title">Atividades Recentes</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Venda</th>
                  <th>Status</th>
                  <th>Cliente</th>
                  <th>Total R$</th>
                  <th>Pagamento</th>
                  <th>Vendedor</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {data.sales.map((sale, i) => (
                  <tr key={i}>
                    <td>{sale.id}</td>
                    <td>
                      <span className="status-badge" style={{ background: (STATUS_COLOR[sale.status] || '#888') + '22', color: STATUS_COLOR[sale.status] || '#888' }}>
                        {sale.status}
                      </span>
                    </td>
                    <td>{sale.client}</td>
                    <td>{formatCurrency(sale.total)}</td>
                    <td>{sale.payment}</td>
                    <td>{sale.seller}</td>
                    <td>
                      <button className="btn-icon">···</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}