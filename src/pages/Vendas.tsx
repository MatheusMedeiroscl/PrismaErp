// src/pages/Vendas.tsx
import { useEffect, useState, useRef } from 'react'
import { Sidebar } from '../components/SideBar'
import { Service } from '../shared/services/Service'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import '../style/dashboard.css'
import '../style/modal.css'

interface VendasData {
  sales: any[]
  summary: { total: number; received: number; pending: number; cancelled: number }
}

const STATUS_COLOR: Record<string, string> = {
  'Recebido': '#22c55e',
  'A Receber': '#f59e0b',
  'Pendente': '#3b82f6',
  'Cancelado': '#ef4444',
}

const STATUS_OPTIONS = ['A Receber', 'Recebido', 'Pendente', 'Cancelado']

const INITIAL_FORM = { client: '', seller: '', product: '', quantity: '1', payment: 'Pix', total: '', status: 'A Receber', date: '' }
const INITIAL_FILTER = { cliente: '', data: '' }

export function Vendas() {
  const [data, setData] = useState<VendasData | null>(null)
  const [catalogItems, setCatalogItems] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [filter, setFilter] = useState(INITIAL_FILTER)
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const actionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Service.GetSales().then(setData)
    Service.GetCatalog().then(r => setCatalogItems(r.catalogItems))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setOpenActionId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function formatCurrency(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  async function handleSubmit() {
    if (!form.client || !form.total) return

    // Desconta do estoque se um produto foi informado
    if (form.product) {
      const productsData = await Service.GetProducts()
      const product = productsData.products.find(
        (p: any) => p.name.toLowerCase() === form.product.toLowerCase() && p.status === 'Em Estoque'
      )
      if (product) {
        const newStock = Math.max(0, product.stock - Number(form.quantity))
        await Service.UpdateProduct(product.id, { stock: newStock })
      }
    }

await Service.CreateSale({
  ...form,
  total: Number(form.total),
  quantity: Number(form.quantity),
  date: form.date || new Date().toISOString().split('T')[0],
})
    setShowModal(false)
    setForm(INITIAL_FORM)
    Service.GetSales().then(setData)
  }

  async function handleChangeStatus(sale: any, newStatus: string) {
    setOpenActionId(null)
    await Service.UpdateSale(sale.id, { status: newStatus })
    Service.GetSales().then(setData)
  }

  const filteredSales = (data?.sales ?? []).filter(s => {
    const matchCliente = !filter.cliente || s.client.toLowerCase().includes(filter.cliente.toLowerCase())
    const matchData = !filter.data || s.date?.startsWith(filter.data)
    return matchCliente && matchData
  })

  const hasFilter = !!(filter.cliente || filter.data)

  const statusSummary = [
    { label: 'Pix', value: data?.sales.filter(s => s.payment === 'Pix').length ?? 0, color: '#22c55e' },
    { label: 'Boleto', value: data?.sales.filter(s => s.payment === 'Boleto').length ?? 0, color: '#3b82f6' },
    { label: 'Dinheiro', value: data?.sales.filter(s => s.payment === 'Dinheiro').length ?? 0, color: '#f59e0b' },
    { label: 'Cancelado', value: data?.sales.filter(s => s.status === 'Cancelado').length ?? 0, color: '#ef4444' },
  ]

  const topClients = (() => {
    const sales = data?.sales ?? []
    const map: Record<string, string> = {}
    sales.forEach(s => {
      if (!map[s.client] || s.date > map[s.client]) map[s.client] = s.date
    })
    return Object.entries(map)
      .map(([client, lastDate]) => {
        const days = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
        return { client, days }
      })
      .sort((a, b) => b.days - a.days)
      .slice(0, 5)
  })()

  const topProducts = (() => {
    const sales = data?.sales ?? []
    const map: Record<string, number> = {}
    sales.forEach(s => {
      if (s.product) map[s.product] = (map[s.product] || 0) + s.total
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4)
  })()

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
          <h1 className="page-title">Vendas</h1>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ Novo Registro</button>
          </div>
        </div>

        <div className="dashboard-inner">
          <div className="kpi-cards-row">
            <div className="kpi-card">
              <span className="kpi-card-label">Total Recebido</span>
              <span className="kpi-card-value">{formatCurrency(data.summary.received)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Total Faturado</span>
              <span className="kpi-card-value">{formatCurrency(data.summary.total)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">A Receber / Pendente</span>
              <span className="kpi-card-value">{data.summary.pending}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Cancelados</span>
              <span className="kpi-card-value">{formatCurrency(data.summary.cancelled)}</span>
            </div>
          </div>

          <div className="vendas-mid-row">
            <div className="table-card">
              <h3 className="chart-title">Clientes Inativos</h3>
              <table className="data-table">
                <thead><tr><th>Cliente</th><th>Dias Inativos</th></tr></thead>
                <tbody>
                  {topClients.length === 0
                    ? <tr><td colSpan={2} className="empty-row">Sem dados</td></tr>
                    : topClients.map((c, i) => (
                      <tr key={i}><td>{c.client}</td><td>{c.days} dias</td></tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="table-card">
              <h3 className="chart-title">Top Produtos Vendidos</h3>
              <table className="data-table">
                <thead><tr><th>#</th><th>Produto</th><th>Total R$</th></tr></thead>
                <tbody>
                  {topProducts.length === 0
                    ? <tr><td colSpan={3} className="empty-row">Sem dados</td></tr>
                    : topProducts.map((p, i) => (
                      <tr key={i}><td>{i + 1}</td><td>{p.name}</td><td>{formatCurrency(p.value)}</td></tr>
                    ))}
                </tbody>
              </table>
            </div>

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
                      <div className="status-bar-fill" style={{ width: `${data.sales.length ? (s.value / data.sales.length) * 100 : 0}%`, background: s.color }} />
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
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {statusSummary.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="table-card full-width">
            <div className="table-card-header">
              <h3 className="chart-title">Atividades Recentes</h3>
              <div className="filter-wrapper" ref={filterRef}>
                <button className={`btn-secondary ${hasFilter ? 'btn-filter-active' : ''}`}
                  onClick={() => setShowFilter(v => !v)}>
                  ≡ Filtros {hasFilter && <span className="filter-dot" />}
                </button>
                {showFilter && (
                  <div className="filter-popover">
                    <p className="filter-title">Filtrar por</p>
                    <label className="filter-label">Cliente</label>
                    <input className="filter-input" placeholder="Nome do cliente..."
                      value={filter.cliente} onChange={e => setFilter(f => ({ ...f, cliente: e.target.value }))} />
                    <label className="filter-label">Data</label>
                    <input className="filter-input" type="date"
                      value={filter.data} onChange={e => setFilter(f => ({ ...f, data: e.target.value }))} />
                    <button className="btn-ghost" onClick={() => setFilter(INITIAL_FILTER)}>Limpar filtros</button>
                  </div>
                )}
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Venda</th><th>Status</th><th>Cliente</th>
                  <th>Total R$</th><th>Pagamento</th><th>Vendedor</th><th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0
                  ? <tr><td colSpan={7} className="empty-row">Nenhum resultado encontrado</td></tr>
                  : filteredSales.map((sale, i) => (
                    <tr key={i}>
                      <td>{sale.id}</td>
                      <td>
                        <span className="status-badge" style={{
                          background: (STATUS_COLOR[sale.status] || '#888') + '22',
                          color: STATUS_COLOR[sale.status] || '#888'
                        }}>
                          {sale.status}
                        </span>
                      </td>
                      <td>{sale.client}</td>
                      <td>{formatCurrency(sale.total)}</td>
                      <td>{sale.payment}</td>
                      <td>{sale.seller}</td>
                      <td>
                        <div style={{ position: 'relative', display: 'inline-block' }}
                          ref={openActionId === sale.id ? actionRef : null}>
                          <button className="btn-icon"
                            onClick={() => setOpenActionId(openActionId === sale.id ? null : sale.id)}>
                            ···
                          </button>
                          {openActionId === sale.id && (
                            <div className="filter-popover" style={{ minWidth: 140, padding: '6px 0' }}>
                              {STATUS_OPTIONS.filter(s => s !== sale.status).map(status => (
                                <button key={status} className="btn-ghost"
                                  style={{ width: '100%', textAlign: 'left', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}
                                  onClick={() => handleChangeStatus(sale, status)}>
                                  <span style={{
                                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                    background: STATUS_COLOR[status] || '#888'
                                  }} />
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nova Venda</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div>
                <label className="modal-label">Cliente *</label>
                <input className="modal-input" placeholder="Nome do cliente" value={form.client}
                  onChange={e => setForm(f => ({ ...f, client: e.target.value }))} />
              </div>
              <div>
                <label className="modal-label">Vendedor</label>
                <input className="modal-input" placeholder="Nome do vendedor" value={form.seller}
                  onChange={e => setForm(f => ({ ...f, seller: e.target.value }))} />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label className="modal-label">Produto</label>
                  <select className="modal-input" value={form.product}
                    onChange={e => setForm(f => ({ ...f, product: e.target.value }))}>
                    <option value="">Selecione um produto...</option>
                    {catalogItems.map((c, i) => (
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Quantidade</label>
                  <input className="modal-input" type="number" placeholder="1" value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label className="modal-label">Total (R$) *</label>
                  <input className="modal-input" type="number" placeholder="0,00" value={form.total}
                    onChange={e => setForm(f => ({ ...f, total: e.target.value }))} />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Data</label>
                  <input className="modal-input" type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label className="modal-label">Pagamento</label>
                  <select className="modal-input" value={form.payment}
                    onChange={e => setForm(f => ({ ...f, payment: e.target.value }))}>
                    <option>Pix</option><option>Boleto</option>
                    <option>Dinheiro</option><option>Cartão</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label">Status</label>
                  <select className="modal-input" value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option>A Receber</option><option>Recebido</option>
                    <option>Pendente</option><option>Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSubmit}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}