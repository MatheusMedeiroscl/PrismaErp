// src/pages/Estoque.tsx
import { useEffect, useState, useRef } from 'react'
import { Sidebar } from '../components/SideBar'
import { Service } from '../shared/services/Service'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import '../style/Dashboard.css'
import '../style/modal.css'

interface EstoqueData {
  products: any[]
  summary: { totalStock: number; totalValue: number; lowStockCount: number; totalProducts: number }
  lowStock: any[]
  monthlyMovement: { month: string; entries: number; exits: number }[]
}

const STATUS_COLOR: Record<string, string> = {
  'Em Estoque': '#22c55e',
  'Em Pedido': '#f59e0b',
}

const INITIAL_FORM = { name: '', category: '', stock: '', price: '', status: 'Em Estoque' }
const INITIAL_FILTER = { produto: '', categoria: '' }

export function Estoque() {
  const [data, setData] = useState<EstoqueData | null>(null)
  const [catalogItems, setCatalogItems] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [filter, setFilter] = useState(INITIAL_FILTER)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Service.GetProducts().then(setData)
    Service.GetCatalog().then(r => setCatalogItems(r.catalogItems))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function formatCurrency(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  function getUrgency(product: any) {
    if (product.status === 'Em Pedido') return { label: 'Em Pedido', color: '#f59e0b' }
    return { label: 'Em Estoque', color: '#22c55e' }
  }

  async function handleToggleStatus(product: any) {
    await Service.UpdateProduct(product.id, { status: 'Em Estoque' })
    Service.GetProducts().then(setData)
  }

  async function handleSubmit() {
    if (!form.name || !form.stock || !form.price) return
    await Service.CreateProduct({
      name: form.name,
      category: form.category,
      stock: Number(form.stock),
      price: Number(form.price),
      status: form.status,
    })
    setShowModal(false)
    setForm(INITIAL_FORM)
    Service.GetProducts().then(setData)
  }

  const filteredProducts = (data?.products ?? []).filter(p => {
    const matchProduto = !filter.produto || p.name.toLowerCase().includes(filter.produto.toLowerCase())
    const matchCategoria = !filter.categoria || p.category.toLowerCase().includes(filter.categoria.toLowerCase())
    return matchProduto && matchCategoria
  })

  const hasFilter = !!(filter.produto || filter.categoria)

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
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ Novo Registro</button>
          </div>
        </div>

        <div className="dashboard-inner">
          <div className="kpi-cards-row">
            <div className="kpi-card">
              <span className="kpi-card-label">Total de Produtos</span>
              <span className="kpi-card-value">{data.summary.totalProducts}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Unidades em Estoque</span>
              <span className="kpi-card-value">{data.summary.totalStock.toLocaleString('pt-BR')}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Valor Total</span>
              <span className="kpi-card-value">{formatCurrency(data.summary.totalValue)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Em Pedido</span>
              <span className="kpi-card-value">{data.summary.lowStockCount}</span>
            </div>
          </div>

          <div className="estoque-mid-row">
            <div className="chart-card">
              <h3 className="chart-title">Movimentação do mês</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.monthlyMovement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="entries" name="Entradas" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="exits" name="Saídas" fill="#a5b4fc" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="table-card">
              <h3 className="chart-title">Alertas de Reposição</h3>
              <div className="alert-list">
                {data.lowStock.length === 0
                  ? <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', padding: '8px 0' }}>Nenhum produto em pedido</p>
                  : data.lowStock.map((p, i) => {
                    const urgency = getUrgency(p)
                    return (
                      <div className="alert-item" key={i}>
                        <div className="alert-info">
                          <span className="alert-name">{p.name}</span>
                          <span className="alert-sub">{p.category} · {p.stock} unidades</span>
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

          <div className="table-card full-width">
            <div className="table-card-header">
              <h3 className="chart-title">Produtos</h3>
              <div className="filter-wrapper" ref={filterRef}>
                <button
                  className={`btn-secondary ${hasFilter ? 'btn-filter-active' : ''}`}
                  onClick={() => setShowFilter(v => !v)}
                >
                  ≡ Filtros {hasFilter && <span className="filter-dot" />}
                </button>
                {showFilter && (
                  <div className="filter-popover">
                    <p className="filter-title">Filtrar por</p>
                    <label className="filter-label">Produto</label>
                    <input className="filter-input" placeholder="Nome do produto..."
                      value={filter.produto} onChange={e => setFilter(f => ({ ...f, produto: e.target.value }))} />
                    <label className="filter-label">Categoria</label>
                    <input className="filter-input" placeholder="Ex: Frutas..."
                      value={filter.categoria} onChange={e => setFilter(f => ({ ...f, categoria: e.target.value }))} />
                    <button className="btn-ghost" onClick={() => setFilter(INITIAL_FILTER)}>Limpar filtros</button>
                  </div>
                )}
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Quantidade</th>
                  <th>Preço Total</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0
                  ? <tr><td colSpan={6} className="empty-row">Nenhum resultado encontrado</td></tr>
                  : filteredProducts.map((p, i) => {
                    const color = STATUS_COLOR[p.status] || '#888'
                    return (
                      <tr key={i}>
                        <td>{p.name}</td>
                        <td>{p.category}</td>
                        <td>{p.stock}</td>
                        <td>{formatCurrency(p.stock * p.price)}</td>
                        <td>
                          <span className="status-badge" style={{ background: color + '22', color }}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          {p.status === 'Em Pedido' && (
                            <button className="btn-icon" title="Marcar como Em Estoque"
                              onClick={() => handleToggleStatus(p)}>
                              ✓ Recebido
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Produto</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div>
                <label className="modal-label">Produto *</label>
                <select className="modal-input" value={form.name}
                  onChange={e => {
                    const selected = catalogItems.find(c => c.name === e.target.value)
                    setForm(f => ({ ...f, name: e.target.value, category: selected?.category || '' }))
                  }}>
                  <option value="">Selecione um produto...</option>
                  {catalogItems.map((c, i) => (
                    <option key={i} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="modal-label">Categoria</label>
                <input className="modal-input" placeholder="Preenchida automaticamente" value={form.category} readOnly
                  style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label className="modal-label">Quantidade *</label>
                  <input className="modal-input" type="number" placeholder="0" value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Preço por Unidade (R$) *</label>
                  <input className="modal-input" type="number" placeholder="0,00" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="modal-label">Status</label>
                <select className="modal-input" value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option>Em Estoque</option>
                  <option>Em Pedido</option>
                </select>
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