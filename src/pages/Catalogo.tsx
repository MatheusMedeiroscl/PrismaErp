import { useEffect, useState } from 'react'
import '../style/Dashboard.css'
import { PageLayout } from '../shared/layout/PageLayout'
import { KpiCard } from '../components/Kpi'
import { ProductTable } from '../components/ProductTable'
import { ProductService } from '../shared/services/ProductService'
import { useAuth } from '../shared/context/AuthContext'

export function Catalogo() {
  const { token } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'clients'>('products')

  useEffect(() => {
    ProductService.getAll(token).then(r => setProducts(r))
  }, [])

  const categories = new Set(products.map(p => p.category).filter(Boolean)).size

  const kpisProdutos = [
    { label: 'Total de Produtos', value: products.length },
    { label: 'Categorias', value: categories },
  ]

  async function refreshProducts() {
    ProductService.getAll(token).then(r => setProducts(r))
  }

  return (
    <PageLayout title='Catálogo'
      actions={
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13, padding: '6px 16px' }}
            onClick={() => setActiveTab('products')}>Produtos</button>
          <button className={activeTab === 'clients' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13, padding: '6px 16px' }}
            onClick={() => setActiveTab('clients')}>Clientes</button>
        </div>
      }>

      <div className="kpi-cards-row">
        {kpisProdutos.map(kpi => (
          <KpiCard className='kpi-card' key={kpi.label} label={kpi.label} value={kpi.value} />
        ))}
      </div>

      {activeTab === 'products' && (
        <ProductTable
          products={products}
          onCreate={async (form) => {
            await ProductService.create(form, token)
            await refreshProducts()
          }}
          onUpdate={async (id, form) => {
            await ProductService.update(id, form, token)
            await refreshProducts()
          }}
          onDelete={async (id) => {
            await ProductService.delete(id, token)
            await refreshProducts()
          }}
        />
      )}
    </PageLayout>
  )
}