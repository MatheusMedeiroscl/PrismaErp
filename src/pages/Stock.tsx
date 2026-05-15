import { useEffect, useState } from "react";
import { useAuth } from "../shared/context/AuthContext";
import { PageLayout } from "../shared/layout/PageLayout";
import { StockService } from "../shared/services/StockServices";
import { formatCurrency, statusLabel } from "../shared/utils/Format";
import { Modal } from "../components/Modal";
import { useModal } from "../shared/hooks/Modal";
import { ProductService } from "../shared/services/ProductService";
import { FilterPopover } from "../components/Filter";
import { STATUS_STORAGE_COLOR } from "../shared/utils/Colors";

import '../style/Stock.css'
import '../style/index.css'
import { KpiCard } from "../components/Kpi";
import { TableLayout } from "../components/Table";
import type { IProduct, Istock } from "../shared/utils/Models";




const INITIAL_FORM = { productId: 0, quantity: '', type: '' }
const INITIAL_STOCK = {name: '', id: 0, quantity: 0, status: ''}
const INITIAL_FILTER = {name: ''}

export function StockPage(){
    const {token} = useAuth();
    const [refresh, setRefresh] = useState(false);
    const [stocks, setStocks] = useState<Istock[]>([]);
    const { isOpen, open, close } = useModal();
    const { isOpen: isEditOpen, open: openEdit, close: closeEdit } = useModal(); 
    const [selectedStock, setSelectedStock] = useState(INITIAL_STOCK);
    const [form, setForm] = useState(INITIAL_FORM);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [filter, setFilter] = useState(INITIAL_FILTER)
    const [dropdownPos, setDropdownPos] = useState<{top: number, left: number, stock: Istock} | null>(null);

    useEffect(() => {
        StockService.getAll(token).then(r => setStocks(r))
        ProductService.getAll(token).then(p => setProducts(p))
    }, [refresh])

    async function createStock(){

        await StockService.create(token, {
            idProduct: Number(form.productId),
            type: form.type,
            quantity: Number(form.quantity)
        })
        close()
        setRefresh(!refresh);            
    }

    async function updateStock(){

        await StockService.updateStock(token, selectedStock.id, {
            quantity: Number(selectedStock.quantity),
            status: selectedStock?.status
        })

        closeEdit();
        setRefresh(!refresh);   
    }

    async function receivedStock(id:number) {
        await StockService.updateStock(token, id, {
            quantity: null,
            status: "AVAILABLE"
        });
        setRefresh(!refresh);  
    }

    async function delelteStock(id:number) {
        await StockService.delete(token, id)
        setRefresh(!refresh);    

    }
    const handleDropdown = (e: React.MouseEvent<HTMLButtonElement>, stock: Istock) => {
        if(dropdownPos) return setDropdownPos(null); // fecha se já está aberto
        const rect = e.currentTarget.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom, left: rect.right - 160, stock });

    }



    const filteredStocks = stocks.filter(s => {
        const matchProduto = !filter.name || s.name.toLowerCase().includes(filter.name.toLowerCase())
        return matchProduto
    })
  const hasFilter = !!(filter.name)

  const kpis = [
    {label: 'Total de Produtos', value: stocks.reduce((acc, s) => acc + s.quantity, 0)},
    {label: 'Valor Total em Estoque', value: formatCurrency(stocks.reduce((acc, s) => acc + (s.costPrice * s.quantity), 0))},
    {label: 'Produtos em Pedido', value: stocks.filter(s => s.status === 'ORDER').reduce((acc, s) => acc + s.quantity, 0)},

  ]



    return (
    <PageLayout 
        title= "Análise de Estoque"
        actions = {<button onClick={open} className="btn-primary"> + Novo Registro </button>}
    >

      <div className="dashboard-inner">
        <div className="kpi-cards-row">
          {kpis.map(kpi => (
            <KpiCard className="kpi-card" key={kpi.label} label={kpi.label} value={kpi.value} />
          ))}
        </div>
    </div>
        <TableLayout
            title="Estoque"
            filter = {
                <FilterPopover
                    hasFilter={hasFilter}
                    onClear={() => setFilter(INITIAL_FILTER)}
                    fields={[
                        { label: 'Produto', placeholder: 'Nome do produto', value: filter.name, onChange: v => setFilter(f => ({ ...f, produto: v })) },
              ]} />
            }
        headers={<>
            <th>ID</th>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Total</th>
            <th>Data</th>
            <th>status</th>
            <th>ações</th>
        </>}>
        {filteredStocks.length === 0 
            ? <tr><td colSpan={6} className="empty-row">Nenhum resultado encontrado</td></tr>
            : filteredStocks.map((stock, i) => {
                const color = STATUS_STORAGE_COLOR[stock.status] || '#888'

                return (
                
                <tr key={i}>
                    <td>{stock.id}</td>
                    <td>{stock.name}</td>
                    <td>{stock.quantity}</td>
                    <td>{formatCurrency(stock.costPrice * stock.quantity)}</td>
                    <td>{new Date(stock.createAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                        <span className="status-badge" style={{ background: color + '22', color }}>
                          {statusLabel[stock.status]}
                        </span>
                    </td>
                    {stock.status === "ORDER" ? (
                    <td style={{ position: "relative" }}>
                        <button onClick={(e) => handleDropdown(e, stock)} className="btn-icon"> ··· </button>
                        {dropdownPos  && (
                            <div  style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 1000 }}  className= "dropdownCard">
                                <p className="dropdownBtn"
                                    onClick={() => {
                                        receivedStock(stock.id)
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                                     Recebido
                                </p>
                                <p className="dropdownBtn"
                                    onClick={() => {
                                        setSelectedStock({name: stock.name, id: stock.id, quantity: stock.quantity, status: stock.status });
                                        openEdit();
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#262c28", display: "inline-block" }} />
                                     Editar Pedido
                                </p>   

                                <p className="dropdownBtn" onClick={() => delelteStock(stock.id)}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#262c28", display: "inline-block" }} />
                                     Deletar Pedido
                                </p>                                  
                            </div>
                        )}
                    </td> ) : ( <td></td> )}
                </tr>
            )})}
        </TableLayout>
    {isOpen && (
        <Modal title="Novo Registro" onClose={close}
            footer= {
            <div>
                <button className="btn-secondary" onClick={close}>Cancelar</button>
                <button className="btn-primary" onClick={createStock}>Salvar</button>
            </div>
         }>

            <label className="modal-label">Produto</label>
            <select className="modal-input" value={form.productId}
                onChange={(e: { target: { value: any; }; }) => setForm(f => ({...f, productId: Number(e.target.value)}))}>
                <option value={0}>Selecione um produto...</option>
                {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                ))}
            </select>

            <div className="modal-row">
                <div className="modal-field">
                    <label className="modal-label">Quantidade *</label>
                    <input className="modal-input" type="number" placeholder="0" value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                <div>
                <label className="modal-label">Tipo</label>
                    <select className="modal-input" value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                        <option value="IN">Entrada</option>
                        <option value="ORDER">Pedido</option>
                    </select>
                </div>
            </div>
        </Modal>
    )}
    {isEditOpen && (
        <Modal 
        title="Editar Pedido"
        onClose={closeEdit}
        footer= {
                <div>
                    <button className="btn-secondary" onClick={close}>Cancelar</button>
                    <button className="btn-primary" onClick={updateStock} >Salvar</button>
                </div>}
        >
        <h3>Produto: {selectedStock?.name}</h3>

        <div className="modal-row">
            <div className="modal-field">
                <label className="modal-label">Quantidade</label>
                <input className="modal-input" type="number" placeholder="0" value={selectedStock?.quantity}
                        onChange={e => setSelectedStock(f => ({ ...f, quantity: Number(e.target.value) }))}/>
            </div>
            <div>
                <label className="modal-label">Tipo</label>
                    <select className="modal-input" value={selectedStock?.status}
                        onChange={e => setSelectedStock(f =>({ ...f, status: e.target.value }))}>
                        <option value="AVAILABLE">Entrada</option>
                        <option value="ORDER">Pedido</option>
                    </select>
                </div>
            </div>
        </Modal>

    )}

    </PageLayout>
    

)
}