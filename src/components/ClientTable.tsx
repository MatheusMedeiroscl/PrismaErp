import { useState } from 'react'
import { formatCurrency } from '../shared/utils/Format'
import { Modal } from '../components/Modal'
import { useModal } from '../shared/hooks/Modal'

const INITIAL_CLIENT_FORM = { establishment: '', responsible: '', cnpj: '' }

interface Props {
  clients: any[]
  sales: any[]
  onCreate: (form: { establishment: string; responsible: string; cnpj: string }) => Promise<void>
  onUpdate: (id: string, form: { establishment: string; responsible: string; cnpj: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ClientTable({ clients, sales, onCreate, onUpdate, onDelete }: Props) {
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [editingClient, setEditingClient] = useState<any | null>(null)
  const [clientForm, setClientForm] = useState(INITIAL_CLIENT_FORM)
  const [search, setSearch] = useState('')
  const modal = useModal()

  function openEdit(client: any) {
    setEditingClient(client)
    setClientForm({ establishment: client.establishment, responsible: client.responsible || '', cnpj: client.cnpj || '' })
    modal.open()
  }

  function openCreate() {
    setEditingClient(null)
    setClientForm(INITIAL_CLIENT_FORM)
    modal.open()
  }

  async function handleSubmit() {
    if (!clientForm.establishment) return
    if (editingClient) {
      await onUpdate(editingClient.id, clientForm)
    } else {
      await onCreate(clientForm)
    }
    modal.close()
  }

  function getClientStats(establishment: string) {
    const clientSales = sales.filter(s => s.client === establishment && s.status !== 'Cancelado')
    const totalComprado = clientSales.reduce((acc, s) => acc + Number(s.total), 0)
    return { qtdPedidos: clientSales.length, totalComprado }
  }

  const filtered = clients.filter(c =>
    !search || c.establishment.toLowerCase().includes(search.toLowerCase()) ||
    c.responsible?.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj?.toLowerCase().includes(search.toLowerCase())
  )

  const selectedStats = selectedClient ? getClientStats(selectedClient.establishment) : null

  return (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div className="table-card" style={{ flex: 1, minWidth: 0 }}>
          <div className="table-card-header">
            <input className="filter-input" placeholder="Buscar cliente..."
              value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
            <button className="btn-primary" onClick={openCreate}>+ Novo Cliente</button>
          </div>
          <table className="data-table">
            <thead><tr><th>Estabelecimento</th><th>Responsável</th><th>CNPJ</th><th>Ação</th></tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={4} className="empty-row">Nenhum cliente cadastrado</td></tr>
                : filtered.map((c, i) => (
                  <tr key={i} style={{ cursor: 'pointer', background: selectedClient?.id === c.id ? 'var(--color-background-secondary)' : '' }}
                    onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)}>
                    <td>{c.establishment}</td>
                    <td>{c.responsible || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.cnpj || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(c) }}>Editar</button>
                        <button className="btn-icon" style={{ color: '#ef4444' }}
                          onClick={e => { e.stopPropagation(); onDelete(c.id) }}>Remover</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {selectedClient && selectedStats && (
          <div className="table-card" style={{ width: 280, flexShrink: 0 }}>
            <div style={{ padding: '4px 0 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 className="chart-title" style={{ margin: 0 }}>Detalhes</h3>
                <button className="btn-icon" style={{ fontSize: 16 }} onClick={() => setSelectedClient(null)}>✕</button>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{selectedClient.establishment}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{selectedClient.responsible || 'Sem responsável'}</p>
              {selectedClient.cnpj && (
                <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-secondary)', marginBottom: 16 }}>CNPJ: {selectedClient.cnpj}</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--color-background-secondary)' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Pedidos Realizados</span>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: '2px 0 0' }}>{selectedStats.qtdPedidos}</p>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--color-background-secondary)' }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Total Comprado</span>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#22c55e', margin: '2px 0 0' }}>{formatCurrency(selectedStats.totalComprado)}</p>
                </div>
              </div>
              <button className="btn-secondary" style={{ width: '100%', marginTop: 16, fontSize: 13 }} onClick={() => openEdit(selectedClient)}>
                Editar Cliente
              </button>
            </div>
          </div>
        )}
      </div>

      {modal.isOpen && (
        <Modal title={editingClient ? 'Editar Cliente' : 'Novo Cliente'} onClose={modal.close}
          footer={<>
            <button className="btn-secondary" onClick={modal.close}>Cancelar</button>
            <button className="btn-primary" onClick={handleSubmit}>Salvar</button>
          </>}>
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
        </Modal>
      )}
    </>
  )
}