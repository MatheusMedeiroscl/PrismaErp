// src/pages/Vendas.tsx
import { useEffect, useState, useRef } from 'react'
import { Service } from '../shared/services/Service'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts'
import '../style/Dashboard.css'
import '../style/Modal.css'
import { PageLayout } from '../shared/layout/PageLayout'
import { KpiCard } from '../components/Kpi'

interface VendasData {
  sales: any[]
  summary: { total: number; received: number; pending: number; cancelled: number }
}

interface SaleItem {
  product: string
  quantity: number
  unitPrice: number
}

const STATUS_COLOR: Record<string, string> = {
  'Recebido': '#22c55e',
  'A Receber': '#f59e0b',
  'Pendente': '#3b82f6',
  'Cancelado': '#ef4444',
}

const STATUS_OPTIONS = ['A Receber', 'Recebido', 'Pendente', 'Cancelado']
const EMPTY_ITEM: SaleItem = { product: '', quantity: 1, unitPrice: 0 }
const INITIAL_FORM = { client: '', seller: '', payment: 'Pix', status: 'A Receber', date: '' }
const INITIAL_FILTER = { cliente: '', data: '' }

// Componente de select com busca reutilizável
function SearchSelect({
  options,
  value,
  onChange,
  placeholder,
  footer,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder: string
  footer?: React.ReactNode
}) {
  const [search, setSearch] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  useEffect(() => { setSearch(value) }, [value])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function openDropdown() {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
        background: '#ffffff',
        border: '1px solid var(--color-border-secondary)',
        borderRadius: 8,
        maxHeight: 200,
        overflowY: 'auto',
        boxShadow: '0 8px 24px rgba(151, 151, 151, 0.6)',
      })
    }
    setOpen(true)
  }

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        className="modal-input"
        style={{ margin: 0 }}
        placeholder={placeholder}
        value={search}
        onChange={e => { setSearch(e.target.value); openDropdown() }}
        onFocus={openDropdown}
      />
      {open && (
        <div style={dropdownStyle}>
          {filtered.length === 0
            ? <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Nenhum resultado
              </div>
            : filtered.map((o, i) => (
              <div key={i}
                style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', color: 'var(--color-text-primary)' }}
                onMouseDown={() => { onChange(o); setSearch(o); setOpen(false) }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                {o}
              </div>
            ))}
          {footer && (
            <div style={{ borderTop: '1px solid var(--color-border-tertiary)' }}>
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Vendas() {
  const [data, setData] = useState<VendasData | null>(null)
  const [catalogItems, setCatalogItems] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [showNewClient, setShowNewClient] = useState(false)
  const [newClientForm, setNewClientForm] = useState({ establishment: '', responsible: '' })
  const [form, setForm] = useState(INITIAL_FORM)
  const [items, setItems] = useState<SaleItem[]>([{ ...EMPTY_ITEM }])
  const [filter, setFilter] = useState(INITIAL_FILTER)
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const actionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Service.GetSales().then(setData)
    Service.GetCatalog().then(r => setCatalogItems(r.catalogItems))
    Service.GetClients().then(r => setClients(r.clients))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false)
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) setOpenActionId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function formatCurrency(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  function calcTotal() {
    return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
  }

  function updateItem(index: number, field: keyof SaleItem, value: string | number) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function addItem() { setItems(prev => [...prev, { ...EMPTY_ITEM }]) }

  function removeItem(index: number) {
    setItems(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== index))
  }

  function resetModal() {
    setShowModal(false)
    setShowNewClient(false)
    setForm(INITIAL_FORM)
    setItems([{ ...EMPTY_ITEM }])
    setNewClientForm({ establishment: '', responsible: '' })
  }

  async function handleCreateClient() {
    if (!newClientForm.establishment) return
    const created = await Service.CreateClient(newClientForm)
    setClients(prev => [...prev, created])
    setForm(f => ({ ...f, client: created.establishment }))
    setShowNewClient(false)
    setNewClientForm({ establishment: '', responsible: '' })
  }

  async function handleSubmit() {
    if (!form.client) return
    const validItems = items.filter(i => i.product && i.quantity > 0 && i.unitPrice > 0)
    if (validItems.length === 0) return


    resetModal()

    const total = calcTotal()
    const productsData = await Service.GetProducts()
    for (const item of validItems) {
      const product = productsData.products.find(
        (p: any) => p.name.toLowerCase() === item.product.toLowerCase() && p.status === 'Em Estoque'
      )
      if (product) {
        await Service.UpdateProduct(product.id, { stock: Math.max(0, product.stock - item.quantity) })
      }
    }

    await Service.CreateSale({
      ...form,
      total,
      items: validItems,
      date: form.date || new Date().toISOString().split('T')[0],
    })

 
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
    sales.forEach(s => { if (!map[s.client] || s.date > map[s.client]) map[s.client] = s.date })
    return Object.entries(map)
      .map(([client, lastDate]) => ({
        client,
        days: Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => b.days - a.days).slice(0, 5)
  })()

  const topProducts = (() => {
    const sales = data?.sales ?? []
    const map: Record<string, number> = {}
    sales.forEach(s => {
      ;(s.items ?? []).forEach((item: any) => {
        map[item.product] = (map[item.product] || 0) + item.quantity * item.unit_price
      })
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 4)
  })()

  const clientNames = clients.map(c => c.establishment)
  const productNames = catalogItems.map(c => c.name)

  if (!data) return (
    <>
      <PageLayout title=''><p className="loading-text">Carregando...</p></PageLayout>
    </>
  )

  const kpis = [
    {label: 'Total Vendido', value: formatCurrency(data.summary.total)},
    {label: 'Total Recebido', value: formatCurrency(data.summary.received)},
    {label: 'A Receber / Pendente', value: formatCurrency(data.summary.pending)},
    {label: 'Cancelados', value: formatCurrency(data.summary.cancelled)},
  ]

  return (<>
      <PageLayout title='Análise de Vendas'
        actions= {
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ Novo Registro</button>
      }>

        <div className="dashboard-inner">
          <div className="kpi-cards-row">
              {kpis.map((kpi) =>(
                <KpiCard  className='kpi-card' key={kpi.label}  label={kpi.label} value={kpi.value}/>
                )
              )}           
          </div>

          <div className="vendas-mid-row">
            <div className="table-card">
              <h3 className="chart-title">Clientes Inativos</h3>
              <table className="data-table">
                <thead><tr><th>Cliente</th><th>Dias Inativos</th></tr></thead>
                <tbody>
                  {topClients.length === 0
                    ? <tr><td colSpan={2} className="empty-row">Sem dados</td></tr>
                    : topClients.map((c, i) => <tr key={i}><td>{c.client}</td><td>{c.days} dias</td></tr>)}
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
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{sale.id?.toString().slice(0, 8)}...</td>
                      <td>
                        <span className="status-badge" style={{
                          background: (STATUS_COLOR[sale.status] || '#888') + '22',
                          color: STATUS_COLOR[sale.status] || '#888'
                        }}>
                          {sale.status}
                        </span>
                      </td>
                      <td>{sale.client}</td>
                      <td>{formatCurrency(Number(sale.total))}</td>
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
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: STATUS_COLOR[status] || '#888' }} />
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
      </PageLayout>

      {showModal && (
        <div className="modal-overlay" onClick={resetModal}>
          <div
              className="modal"
              style={{
                maxWidth: 560,
                overflow: 'hidden',
                maxHeight: '90vh',        // ← trava a altura máxima do modal
                height: '90vh',           // ← força o modal a ocupar a altura toda
                display: 'flex',
                flexDirection: 'column',  // ← empilha header / body / footer
              }}
              onClick={e => e.stopPropagation()}
            >
            <div className="modal-header">
              <h2 className="modal-title">Nova Venda</h2>
              <button className="modal-close" onClick={resetModal}>✕</button>
            </div>
            <div
                className="modal-body"
                style={{
                  overflowY: 'scroll',  // ← força a barra sempre visível
                  flex: 1,              // ← ocupa todo o espaço entre header e footer
                  minHeight: 0,         // ← essencial: sem isso o flexbox ignora o overflow
                }}
              >
              <div className="modal-row">
                <div className="modal-field">
                  <label className="modal-label">Cliente *</label>
                  <SearchSelect
                    options={clientNames}
                    value={form.client}
                    onChange={v => setForm(f => ({ ...f, client: v }))}
                    placeholder="Buscar cliente..."
                    footer={
                      <div
                        style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', color: 'var(--color-text-info)', fontWeight: 500 }}
                        onMouseDown={e => { e.preventDefault(); setShowNewClient(v => !v) }}>
                        + Criar novo cliente
                      </div>
                    }
                  />
                  {showNewClient && (
                    <div style={{
                      marginTop: 8, padding: 12, borderRadius: 8,
                      border: '1px solid var(--color-border-secondary)',
                      background: 'var(--color-background-secondary)',
                      display: 'flex', flexDirection: 'column', gap: 8
                    }}>
                      <input className="modal-input" style={{ margin: 0 }}
                        placeholder="Nome do estabelecimento *"
                        value={newClientForm.establishment}
                        onChange={e => setNewClientForm(f => ({ ...f, establishment: e.target.value }))} />
                      <input className="modal-input" style={{ margin: 0 }}
                        placeholder="Responsável (opcional)"
                        value={newClientForm.responsible}
                        onChange={e => setNewClientForm(f => ({ ...f, responsible: e.target.value }))} />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 12px' }}
                          onClick={() => setShowNewClient(false)}>Cancelar</button>
                        <button className="btn-primary" style={{ fontSize: 12, padding: '4px 12px' }}
                          onClick={handleCreateClient}>Criar</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-field">
                  <label className="modal-label">Vendedor</label>
                  <input className="modal-input" placeholder="Nome do vendedor" value={form.seller}
                    onChange={e => setForm(f => ({ ...f, seller: e.target.value }))} />
                </div>
              </div>

              <div style={{ margin: '12px 0 4px' }}>
                <label className="modal-label">Produtos *</label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 96px 28px', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Produto</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Qtd</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Vlr Unit.</span>
                <span />
              </div>

              {items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 96px 28px', gap: 6, marginBottom: 6 }}>
                  <SearchSelect
                    options={productNames}
                    value={item.product}
                    onChange={v => updateItem(i, 'product', v)}
                    placeholder="Buscar produto..."
                  />
                  <input className="modal-input" style={{ margin: 0 }} type="number" min={1} value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', Number(e.target.value))} />
                  <input className="modal-input" style={{ margin: 0 }} type="number" min={0} step="0.01"
                    placeholder="0,00" value={item.unitPrice || ''}
                    onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} />
                  <button onClick={() => removeItem(i)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1 }}>
                    ×
                  </button>
                </div>
              ))}

              <button className="btn-ghost" onClick={addItem} style={{ marginBottom: 12 }}>
                + Adicionar produto
              </button>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 12, paddingTop: 8, borderTop: '1px solid var(--color-border-tertiary)' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Total:</span>
                <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {formatCurrency(calcTotal())}
                </span>
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

              <div className="modal-field">
                <label className="modal-label">Data</label>
                <input className="modal-input" type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={resetModal}>Cancelar</button>
              <button className="btn-primary" onClick={handleSubmit}>Salvar</button>
            </div>
          </div>
        </div>
      )}
  
  </>)
}