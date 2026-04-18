import { useState } from "react"

async function handleSubmit() {
    if (!form.client || !form.total) return
    await Service.CreateSale({
      ...form,
      total: Number(form.total),
      date: form.date || new Date().toISOString().split('T')[0],
    })
    setShowModal(false)
    setForm(INITIAL_FORM)
    Service.GetDashboard().then(setData)
  }



export function Modal(){
    const INITIAL_FORM = { client: '', seller: '', payment: 'Pix', total: '', status: 'A Receber', date: '' }

    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(INITIAL_FORM)

      
    return(


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
    )
}