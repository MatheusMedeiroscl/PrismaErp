import { useState } from 'react'
import { Modal } from '../components/Modal'
import { useModal } from '../shared/hooks/Modal'
import type { IProduct, IProductForm } from '../shared/services/ProductService'

interface Props {
  products: IProduct[]
  onCreate: (form: IProductForm) => Promise<void>
  onUpdate: (id: number, form: IProductForm) => Promise<void>
  onDelete: (id: number, token: string) => Promise<void>
}

export function ProductTable({ products, onCreate, onUpdate }: Props) {
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null)
  const [productForm, setProductForm] = useState<{ name: string; category: string; costPrice: string; salePrice: string }>({ 
    name: '', category: '', costPrice: '', salePrice: '' 
  })
  const [search, setSearch] = useState('')
  const modal = useModal()

  function openEdit(product: IProduct) {
    setEditingProduct(product)
    setProductForm({ 
      name: product.name, 
      category: product.category || '', 
      costPrice: String(product.costPrice), 
      salePrice: String(product.salePrice)
    })
    modal.open()
  }

  function openCreate() {
    setEditingProduct(null)
    setProductForm({ name: '', category: '', costPrice: '', salePrice: '' })
    modal.open()
  }

  async function handleSubmit() {
    if (!productForm.name) return
    const form: IProductForm = {
      name: productForm.name,
      category: productForm.category,
      costPrice: Number(productForm.costPrice),
      salePrice: Number(productForm.salePrice),
    }
    if (editingProduct) {
      await onUpdate(editingProduct.id, form)
    } else {
      await onCreate(form)
    }
    modal.close()
  }

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="table-card">
        <div className="table-card-header">
          <input className="filter-input" placeholder="Buscar produto ou categoria..."
            value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
          <button className="btn-primary" onClick={openCreate}>+ Novo Produto</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Nome</th><th>Categoria</th><th>Preço Custo</th><th>Preço Venda</th><th>Ação</th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={5} className="empty-row">Nenhum produto cadastrado</td></tr>
              : filtered.map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{p.category || '—'}</td>
                  <td>{p.costPrice || '—'}</td>
                  <td>{p.salePrice || '—'}</td>
                  <td>
                    <button className="btn-icon" onClick={() => openEdit(p)}>Editar</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal.isOpen && (
        <Modal title={editingProduct ? 'Editar Produto' : 'Novo Produto'} onClose={modal.close}
          footer={<>
            <button className="btn-secondary" onClick={modal.close}>Cancelar</button>
            <button className="btn-primary" onClick={handleSubmit}>Salvar</button>
          </>}>
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
          <div>
            <label className="modal-label">Preço de Custo</label>
            <input className="modal-input" type="number" placeholder="Preço de custo unitário" value={productForm.costPrice}
              onChange={e => setProductForm(f => ({ ...f, costPrice: e.target.value }))} />
          </div>
          <div>
            <label className="modal-label">Preço de Venda</label>
            <input className="modal-input" type="number" placeholder="Preço de venda" value={productForm.salePrice}
              onChange={e => setProductForm(f => ({ ...f, salePrice: e.target.value }))} />
          </div>
        </Modal>
      )}
    </>
  )
}