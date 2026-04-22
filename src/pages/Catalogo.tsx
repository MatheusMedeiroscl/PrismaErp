// src/pages/Catalogo.tsx
import { useEffect, useState } from 'react'
import { Service } from '../shared/services/Service'
import '../style/Dashboard.css'
import { PageLayout } from '../shared/layout/PageLayout'
import { KpiCard } from '../components/Kpi'
import { formatCurrency } from '../shared/utils/Format'
import { Modal } from '../components/Modal'
import { useModal } from '../shared/hooks/Modal'

const INITIAL_PRODUCT_FORM = { name: '', category: '' }
const INITIAL_CLIENT_FORM = { establishment: '', responsible: '', cnpj: '' }

export function Catalogo() {
  const [products, setProducts] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'clients'>('products')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [editingClient, setEditingClient] = useState<any | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM)
  const [clientForm, setClientForm] = useState(INITIAL_CLIENT_FORM)
  const [search, setSearch] = useState('')
  const modal = useModal();
  useEffect(() => {
    Service.GetCatalog().then(r => setProducts(r.catalogItems))
    Service.GetClients().then(r => setClients(r.clients))
    Service.GetSales().then(r => setSales(r.sales))
  }, [])



  function openEditProduct(product: any) {
    setEditingProduct(product)
    setProductForm({ name: product.name, category: product.category || '' })
    setShowModal(true)
  }

  function openEditClient(client: any) {
    setEditingClient(client)
    setClientForm({
      establishment: client.establishment,
      responsible: client.responsible || '',
      cnpj: client.cnpj || '',
    })
    setShowModal(true)
  }



  async function handleSubmitProduct() {
    if (!productForm.name) return
    if (editingProduct) {
      await Service.UpdateCatalogItem(editingProduct.id, { name: productForm.name, category: productForm.category })
    } else {
      await Service.CreateCatalogItem({ name: productForm.name, category: productForm.category })
    }
    modal.close()
    Service.GetCatalog().then(r => setProducts(r.catalogItems))
  }

  async function handleSubmitClient() {
    if (!clientForm.establishment) return
    if (editingClient) {
      await Service.UpdateClient(editingClient.id, clientForm)
    } else {
      await Service.CreateClient(clientForm)
    }
    modal.close()
    Service.GetClients().then(r => setClients(r.clients))
  }

  async function handleDeleteProduct(id: string) {
    await Service.DeleteCatalogItem(id)
    if (selectedProduct?.id === id) setSelectedProduct(null)
    Service.GetCatalog().then(r => setProducts(r.catalogItems))
  }

  async function handleDeleteClient(id: string) {
    await Service.DeleteClient(id)
    if (selectedClient?.id === id) setSelectedClient(null)
    Service.GetClients().then(r => setClients(r.clients))
  }

  // Estatísticas por produto (baseado nas vendas)
  function getProductStats(productName: string) {
    let qtdVendas = 0
    let totalVendido = 0
    sales.forEach(sale => {
      if (sale.status === 'Cancelado') return
      ;(sale.items ?? []).forEach((item: any) => {
        if (item.product?.toLowerCase() === productName.toLowerCase()) {
          qtdVendas += Number(item.quantity)
          totalVendido += Number(item.quantity) * Number(item.unit_price)
        }
      })
    })
    return { qtdVendas, totalVendido }
  }

  // Estatísticas por cliente (baseado nas vendas)
  function getClientStats(establishment: string) {
    const clientSales = sales.filter(s => s.client === establishment && s.status !== 'Cancelado')
    const totalComprado = clientSales.reduce((acc, s) => acc + Number(s.total), 0)
    return { qtdPedidos: clientSales.length, totalComprado }
  }

  const filteredProducts = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredClients = clients.filter(c =>
    !search || c.establishment.toLowerCase().includes(search.toLowerCase()) ||
    c.responsible?.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj?.toLowerCase().includes(search.toLowerCase())
  )

  const categories = new Set(products.map(p => p.category).filter(Boolean)).size

  const selectedProductStats = selectedProduct ? getProductStats(selectedProduct.name) : null
  const selectedClientStats = selectedClient ? getClientStats(selectedClient.establishment) : null



  const kpisProdutos = [
    {label: 'Total de Produtos', value: formatCurrency(products.length)},
    {label: 'Categorias', value: formatCurrency(categories)},
  ]

  const kpisClientes = [
    {label: 'Total de Clientes', value: formatCurrency(clients.length)},
    {label: 'Com Responsável', value: clients.filter(c => c.responsible).length},
    {label: 'Com CNPJ', value: clients.filter(c => c.cnpj).length},
  ]
  return (<>
      <PageLayout title='Catálogo'
        actions = {
            <button className="btn-primary" onClick={() => {modal.open()}}>
              + {activeTab === 'products' ? 'Novo Produto' : 'Novo Cliente'}
            </button>
      }>

        <div>
          {/* KPI Cards */}
          <div className="kpi-cards-row">
            {activeTab === 'products' ? <>
              {kpisProdutos.map((kpi) =>(
                <KpiCard  className='kpi-card' key={kpi.label}  label={kpi.label} value={kpi.value}/>
                )
              )}     
            </> : <>
              {kpisClientes.map((kpi) =>(
                <KpiCard  className='kpi-card' key={kpi.label}  label={kpi.label} value={kpi.value}/>
                )
              )}    
            </>}
          </div>

          {/* Layout principal: tabela + painel de detalhes */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

            {/* Tabela */}
            <div className="table-card" style={{ flex: 1, minWidth: 0 }}>
              <div className="table-card-header">
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className={activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: 13, padding: '6px 16px' }}
                    onClick={() => { setActiveTab('products'); setSearch(''); setSelectedProduct(null); setSelectedClient(null) }}>
                    Produtos
                  </button>
                  <button
                    className={activeTab === 'clients' ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: 13, padding: '6px 16px' }}
                    onClick={() => { setActiveTab('clients'); setSearch(''); setSelectedProduct(null); setSelectedClient(null) }}>
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
                        <tr
                          key={i}
                          style={{ cursor: 'pointer', background: selectedProduct?.id === p.id ? 'var(--color-background-secondary)' : '' }}
                          onClick={() => setSelectedProduct(selectedProduct?.id === p.id ? null : p)}>
                          <td>{p.name}</td>
                          <td>{p.category || '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn-icon"
                                onClick={e => { e.stopPropagation(); openEditProduct(p) }}>
                                Editar
                              </button>
                              <button className="btn-icon" style={{ color: '#ef4444' }}
                                onClick={e => { e.stopPropagation(); handleDeleteProduct(p.id) }}>
                                Remover
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Estabelecimento</th><th>Responsável</th><th>CNPJ</th><th>Ação</th></tr></thead>
                  <tbody>
                    {filteredClients.length === 0
                      ? <tr><td colSpan={4} className="empty-row">Nenhum cliente cadastrado</td></tr>
                      : filteredClients.map((c, i) => (
                        <tr
                          key={i}
                          style={{ cursor: 'pointer', background: selectedClient?.id === c.id ? 'var(--color-background-secondary)' : '' }}
                          onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)}>
                          <td>{c.establishment}</td>
                          <td>{c.responsible || '—'}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.cnpj || '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn-icon"
                                onClick={e => { e.stopPropagation(); openEditClient(c) }}>
                                Editar
                              </button>
                              <button className="btn-icon" style={{ color: '#ef4444' }}
                                onClick={e => { e.stopPropagation(); handleDeleteClient(c.id) }}>
                                Remover
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Painel de detalhes — produto */}
            {selectedProduct && selectedProductStats && (
              <div className="table-card" style={{ width: 280, flexShrink: 0 }}>
                <div style={{ padding: '4px 0 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 className="chart-title" style={{ margin: 0 }}>Detalhes</h3>
                    <button className="btn-icon" style={{ fontSize: 16 }} onClick={() => setSelectedProduct(null)}>✕</button>
                  </div>

                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                    {selectedProduct.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                    {selectedProduct.category || 'Sem categoria'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--color-background-secondary)' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Qtd. Vendida</span>
                      <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: '2px 0 0' }}>
                        {selectedProductStats.qtdVendas}
                      </p>
                    </div>
                    <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--color-background-secondary)' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Total Faturado</span>
                      <p style={{ fontSize: 18, fontWeight: 700, color: '#22c55e', margin: '2px 0 0' }}>
                        {formatCurrency(selectedProductStats.totalVendido)}
                      </p>
                    </div>
                  </div>

                  <button className="btn-secondary" style={{ width: '100%', marginTop: 16, fontSize: 13 }}
                    onClick={() => openEditProduct(selectedProduct)}>
                    Editar Produto
                  </button>
                </div>
              </div>
            )}

            {/* Painel de detalhes — cliente */}
            {selectedClient && selectedClientStats && (
              <div className="table-card" style={{ width: 280, flexShrink: 0 }}>
                <div style={{ padding: '4px 0 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 className="chart-title" style={{ margin: 0 }}>Detalhes</h3>
                    <button className="btn-icon" style={{ fontSize: 16 }} onClick={() => setSelectedClient(null)}>✕</button>
                  </div>

                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                    {selectedClient.establishment}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    {selectedClient.responsible || 'Sem responsável'}
                  </p>
                  {selectedClient.cnpj && (
                    <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                      CNPJ: {selectedClient.cnpj}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--color-background-secondary)' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Pedidos Realizados</span>
                      <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: '2px 0 0' }}>
                        {selectedClientStats.qtdPedidos}
                      </p>
                    </div>
                    <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--color-background-secondary)' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Total Comprado</span>
                      <p style={{ fontSize: 18, fontWeight: 700, color: '#22c55e', margin: '2px 0 0' }}>
                        {formatCurrency(selectedClientStats.totalComprado)}
                      </p>
                    </div>
                  </div>

                  <button className="btn-secondary" style={{ width: '100%', marginTop: 16, fontSize: 13 }}
                    onClick={() => openEditClient(selectedClient)}>
                    Editar Cliente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageLayout>

      {/* Modal */}
      {showModal && (
        <Modal
          onClose={() => {modal.close()}}
          title={activeTab === 'products' ? editingProduct ? 'Editar Produto' : 'Novo Produto' : editingClient ? 'Editar Cliente' : 'Novo Cliente'}
          footer={
            <>
              <button className="btn-secondary" onClick={() => {modal.close()}}>Cancelar</button>
              <button className="btn-primary" onClick={activeTab === 'products' ? handleSubmitProduct : handleSubmitClient}>
                Salvar
              </button>
            </>
          }
        >
          {activeTab === 'products' ? (
            <>
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
            </>
          ) : (
            <>
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
              <div>
                <label className="modal-label">CNPJ</label>
                <input className="modal-input" placeholder="00.000.000/0000-00 (opcional)" value={clientForm.cnpj}
                  onChange={e => setClientForm(f => ({ ...f, cnpj: e.target.value }))} />
              </div>
            </>
          )}
        </Modal>
      )}
  </>)
}