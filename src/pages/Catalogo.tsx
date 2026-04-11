// src/pages/Catalogo.tsx
import { useEffect, useState } from 'react'
import { Sidebar } from '../components/SideBar'
import { Service } from '../shared/services/Service'
import '../style/dashboard.css'
import '../style/modal.css'

interface CatalogoData {
  catalogItems: any[]
}

const INITIAL_FORM = { name: '', category: '' }

export function Catalogo() {
  const [data, setData] = useState<CatalogoData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Service.GetCatalog().then(setData)
  }, [])

  async function handleSubmit() {
    if (!form.name) return
    await Service.CreateCatalogItem({ name: form.name, category: form.category })
    setShowModal(false)
    setForm(INITIAL_FORM)
    Service.GetCatalog().then(setData)
  }

  async function handleDelete(id: string) {
    await Service.DeleteCatalogItem(id)
    Service.GetCatalog().then(setData)
  }

  const filtered = (data?.catalogItems ?? []).filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

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
          <h1 className="page-title">Catálogo de Produtos</h1>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ Novo Produto</button>
          </div>
        </div>

        <div className="dashboard-inner">
          <div className="kpi-cards-row">
            <div className="kpi-card">
              <span className="kpi-card-label">Total de Produtos</span>
              <span className="kpi-card-value">{data.catalogItems.length}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-card-label">Categorias</span>
              <span className="kpi-card-value">
                {new Set(data.catalogItems.map(p => p.category).filter(Boolean)).size}
              </span>
            </div>
          </div>

          <div className="table-card full-width">
            <div className="table-card-header">
              <h3 className="chart-title">Produtos Cadastrados</h3>
              <input
                className="filter-input"
                placeholder="Buscar produto ou categoria..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 220 }}
              />
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={3} className="empty-row">Nenhum produto cadastrado</td></tr>
                  : filtered.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>{p.category || '—'}</td>
                      <td>
                        <button
                          className="btn-icon"
                          style={{ color: '#ef4444' }}
                          onClick={() => handleDelete(p.id)}
                        >
                          Remover
                        </button>
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
              <h2 className="modal-title">Novo Produto</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div>
                <label className="modal-label">Nome *</label>
                <input className="modal-input" placeholder="Nome do produto" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="modal-label">Categoria</label>
                <input className="modal-input" placeholder="Ex: Frutas, Verduras..." value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
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