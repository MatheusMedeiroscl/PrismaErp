// src/pages/Catalogo.tsx
import { useEffect, useState } from 'react'
import { Sidebar } from '../components/SideBar'
import { Service } from '../shared/services/Service'
import '../style/dashboard.css'
import '../style/modal.css'

const INITIAL_PRODUCT_FORM = { name: '', category: '' }
const INITIAL_CLIENT_FORM = { establishment: '', responsible: '' }

export function Catalogo() {
  const [products, setProducts] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'clients'>('products')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<any | null>(null)
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM)
  const [clientForm, setClientForm] = useState(INITIAL_CLIENT_FORM)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Service.GetCatalog().then(r => setProducts(r.catalogItems))
    Service.GetClients().then(r => setClients(r.clients))
  }, [])

  function openModal() {
    setEditingClient(null)
    setProductForm(INITIAL_PRODUCT_FORM)
    setClientForm(INITIAL_CLIENT_FORM)
    setShowModal(true)
  }

  function openEditClient(client: any) {
    setEditingClient(client)
    setClientForm({ establishment: client.establishment, responsible: client.responsible || '' })
    setShowModal(true)
  }

  async function handleSubmitProduct() {
    if (!productForm.name) return
    await Service.CreateCatalogItem({ name: productForm.name, category: productForm.category })
    setShowModal(false)
    setProductForm(INITIAL_PRODUCT_FORM)
    Service.GetCatalog().then(r => setProducts(r.catalogItems))
  }

  async function handleSubmitClient() {
    if (!clientForm.establishment) return
    if (editingClient) {
      await Service.UpdateClient(editingClient.id, clientForm)
    } else {
      await Service.CreateClient(clientForm)
    }
    setShowModal(false)
    setClientForm(INITIAL_CLIENT_FORM)
    setEditingClient(null)
    Service.GetClients().then(r => setClients(r.clients))
  }

  async function handleDeleteProduct(id: string) {
    await Service.DeleteCatalogItem(id)
    Service.GetCatalog().then(r => setProducts(r.catalogItems))
  }

  async function handleDeleteClient(id: string) {
    await Service.DeleteClient(id)
    Service.GetClients().then(r => setClients(r.clients))
  }

  const filteredProducts = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredClients = clients.filter(c =>
    !search || c.establishment.toLowerCase().includes(search.toLowerCase()) ||
    c.responsible?.toLowerCase().includes(search.toLowerCase())
  )

  const categories = new Set(products.map(p => p.category).filter(Boolean)).size

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="page-content">
        <div className="page-header">
          <h1 className="page-title">Catálogo</h1>
          <div className="header-actions">
            <button className="btn-primary" onClick={openModal}>
              + {activeTab === 'products' ? 'Novo Produto' : 'Novo Cliente'}
            </button>
          </div>
        </div>

        <div className="dashboard-inner">
          <div className="kpi-cards-row">
            {activeTab === 'products' ? <>
              <div className="kpi-card">
                <span className="kpi-card-label">Total de Produtos</span>
                <span className="kpi-card-value">{products.length}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-card-label">Categorias</span>
                <span className="kpi-card-value">{categories}</span>
              </div>
            </> : <>
              <div className="kpi-card">
                <span className="kpi-card-label">Total de Clientes</span>
                <span className="kpi-card-value">{clients.length}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-card-label">Com Responsável</span>
                <span className="kpi-card-value">{clients.filter(c => c.responsible).length}</span>
              </div>
            </>}
          </div>

          <div className="table-card full-width">
            <div className="table-card-header">
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className={activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: 13, padding: '6px 16px' }}
                  onClick={() => { setActiveTab('products'); setSearch('') }}>
                  Produtos
                </button>
                <button
                  className={activeTab === 'clients' ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: 13, padding: '6px 16px' }}
                  onClick={() => { setActiveTab('clients'); setSearch('') }}>
                  Clientes
                </button>
              </div>
              <input
                className="filter-input"
                placeholder={activeTab === 'products' ? 'Buscar produto ou categoria...' : 'Buscar cliente...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 220 }}
              />
            </div>

            {activeTab === 'products' ? (
              <table className="data-table">
                <thead><tr><th>Nome</th><th>Categoria</th><th>Ação</th></tr></thead>
                <tbody>
                  {filteredProducts.length === 0
                    ? <tr><td colSpan={3} className="empty-row">Nenhum produto cadastrado</td></tr>
                    : filteredProducts.map((p, i) => (
                      <tr key={i}>
                        <td>{p.name}</td>
                        <td>{p.category || '—'}</td>
                        <td>
                          <button className="btn-icon" style={{ color: '#ef4444' }}
                            onClick={() => handleDeleteProduct(p.id)}>
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead><tr><th>Estabelecimento</th><th>Responsável</th><th>Ação</th></tr></thead>
                <tbody>
                  {filteredClients.length === 0
                    ? <tr><td colSpan={3} className="empty-row">Nenhum cliente cadastrado</td></tr>
                    : filteredClients.map((c, i) => (
                      <tr key={i}>
                        <td>{c.establishment}</td>
                        <td>{c.responsible || '—'}</td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-icon" onClick={() => openEditClient(c)}>Editar</button>
                          <button className="btn-icon" style={{ color: '#ef4444' }}
                            onClick={() => handleDeleteClient(c.id)}>
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {activeTab === 'products'
                  ? 'Novo Produto'
                  : editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {activeTab === 'products' ? <>
                <div>
                  <label className="modal-label">Nome *</label>
                  <input className="modal-input" placeholder="Nome do produto" value={productForm.name}
                    onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="modal-label">Categoria</label>
                  <input className="modal-input" placeholder="Ex: Frutas, Verduras..." value={productForm.category}
                    onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} />
                </div>
              </> : <>
                <div>
                  <label className="modal-label">Nome do Estabelecimento *</label>
                  <input className="modal-input" placeholder="Ex: Mercado Central" value={clientForm.establishment}
                    onChange={e => setClientForm(f => ({ ...f, establishment: e.target.value }))} />
                </div>
                <div>
                  <label className="modal-label">Responsável</label>
                  <input className="modal-input" placeholder="Nome do responsável (opcional)" value={clientForm.responsible}
                    onChange={e => setClientForm(f => ({ ...f, responsible: e.target.value }))} />
                </div>
              </>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary"
                onClick={activeTab === 'products' ? handleSubmitProduct : handleSubmitClient}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}