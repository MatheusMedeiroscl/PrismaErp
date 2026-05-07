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
interface Istock {
    id: number,
    name: string,
    Quantity: number,
    costPrice: number,
    type: string,
    createAt: string

}
interface IProduct {
    id: number;
    name: string;
    category: string;
    costPrice: number;
    salePrice: number;
}

const INITIAL_FORM = { productId: 0, quantity: '', status: 'IN' }
const INITIAL_FILTER = {name: ''}

export function StockPage(){
    const {token} = useAuth();
    const [refresh, setRefresh] = useState(false);
    const [stocks, setStocks] = useState<Istock[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { isOpen, open, close } = useModal();
    const { isOpen: isEditOpen, open: openEdit, close: closeEdit } = useModal(); 
    const [selectedStock, setSelectedStock] = useState<Istock | null>(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [filter, setFilter] = useState(INITIAL_FILTER)

    useEffect(() => {
        StockService.getAll(token).then(r => setStocks(r))
        ProductService.getAll(token).then(p => setProducts(p))
    }, [refresh])

    async function registryStock(){
    if(!form.productId || !form.quantity)return 
        await StockService.create(token, {
            idProduct: Number(form.productId),
            type: form.status,
            quantity: Number(form.quantity)
        })
        close()
        setRefresh(!refresh);            
    }

    const [dropdownPos, setDropdownPos] = useState<{top: number, left: number, stock: Istock} | null>(null);

    const handleDropdown = (e: React.MouseEvent<HTMLButtonElement>, stock: Istock) => {
        if(dropdownPos) return setDropdownPos(null); // fecha se já está aberto
        const rect = e.currentTarget.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom, left: rect.right - 160, stock });

    }

    const handleUpdate = (stock: Istock, type: string) => {
        let stockForUpdate = {
            id: stock.id,
            quantity: null,
            type: "AVAILABLE"
        }
         StockService.updateStock(token, stockForUpdate)
        setRefresh(!refresh);
    }

    const handleEditModal = (stock: Istock) => {
        setSelectedStock(stock)
        openEdit()
        
    }

    async function updateStock(){
        await StockService.updateStock(token, {
                id: Number(selectedStock?.id),
                type: selectedStock?.type,
                quantity: Number(selectedStock?.Quantity)
         })

        closeEdit()
        setRefresh(!refresh);  
    }

    async function handleDelete(id:number) {
        await StockService.delete(token, id)
        setRefresh(!refresh);    

    }
    const filteredStocks = stocks.filter(s => {
        const matchProduto = !filter.name || s.name.toLowerCase().includes(filter.name.toLowerCase())
        return matchProduto
    })
  const hasFilter = !!(filter.name)

  const kpis = [
    {label: 'Total de Produtos', value: stocks.reduce((acc, s) => acc + s.Quantity, 0)},
    {label: 'Valor Total em Estoque', value: formatCurrency(stocks.reduce((acc, s) => acc + (s.costPrice * s.Quantity), 0))},
    {label: 'Produtos em Pedido', value: stocks.filter(s => s.type === 'ORDER').reduce((acc, s) => acc + s.Quantity, 0)},

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
        {isOpen && (
            <Modal title="Novo Registro" onClose={close}
             footer= {
                <div>
                    <button className="btn-secondary" onClick={close}>Cancelar</button>
                    <button className="btn-primary" onClick={registryStock}>Salvar</button>
                </div>
             }>
                <label className="modal-label">Produto *</label>
                <select className="modal-input" value={form.productId}
                    onChange={e => setForm(f => ({...f, productId: Number(e.target.value)}))}>
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
                        <select className="modal-input" value={form.status}
                            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                            <option value="IN">Entrada</option>
                            <option value="ORDER">Pedido</option>
                        </select>
                    </div>
                </div>
            </Modal>
        )}

        {/* TABELA DE ESTOQUE */}
        <TableLayout
            title="Produtos"
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
                const color = STATUS_STORAGE_COLOR[stock.type] || '#888'

                return (
                
                <tr key={i}>
                    <td>{stock.id}</td>
                    <td>{stock.name}</td>
                    <td>{stock.Quantity}</td>
                    <td>{formatCurrency(stock.costPrice * stock.Quantity)}</td>
                    <td>{new Date(stock.createAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                        <span className="status-badge" style={{ background: color + '22', color }}>
                          {statusLabel[stock.type]}
                        </span>
                    </td>
                    {stock.type === "ORDER" ? (
                    <td style={{ position: "relative" }}>
                        <button onClick={(e) => handleDropdown(e, stock)} className="btn-icon"> ··· </button>
                        {dropdownPos  && (
                            <div  style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 1000 }}  className= "dropdownCard">
                                <p className="dropdownBtn" onClick={() => handleUpdate(stock, "AVAILABLE")}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                                     Recebido
                                </p>
                                <p className="dropdownBtn" onClick={() => handleEditModal(stock)}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#262c28", display: "inline-block" }} />
                                     Editar Pedido
                                </p>   

                                <p className="dropdownBtn" onClick={() => handleDelete(stock.id)}
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
    {isEditOpen && (
        <Modal 
        title="Editar Pedido"
        onClose={closeEdit}
        footer= {
                <div>
                    <button className="btn-secondary" onClick={close}>Cancelar</button>
                    <button className="btn-primary" onClick={updateStock}>Salvar</button>
                </div>}
        >
        <h3>Produto: {selectedStock?.name}</h3>

        <div className="modal-row">
            <div className="modal-field">
                <label className="modal-label">Quantidade *</label>
                <input className="modal-input" type="number" placeholder="0" value={selectedStock?.Quantity}
                        onChange={e => setSelectedStock(f => f ? ({ ...f, Quantity: Number(e.target.value) }) : null)}/>
            </div>
            <div>
                <label className="modal-label">Tipo</label>
                    <select className="modal-input" value={selectedStock?.type}
                        onChange={e => setSelectedStock(f => f ? ({ ...f, status: e.target.value }) : null)}>
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