import { useEffect, useState } from "react";
import { useAuth } from "../shared/context/AuthContext";
import { PageLayout } from "../shared/layout/PageLayout";
import { StockService } from "../shared/services/StockServices";
import { formatCurrency } from "../shared/utils/Format";
import { Modal } from "../components/Modal";
import { useModal } from "../shared/hooks/Modal";
import { ProductService } from "../shared/services/ProductService";


interface Istock {
    id: number,
    name: string,
    Quantity: number,
    costPrice: number,
    status: string,
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

export function StockPage(){
    const {token} = useAuth();
    const [stocks, setStocks] = useState<Istock[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [refresh, setRefresh] = useState(false)
    const { isOpen, open, close } = useModal();
    const [form, setForm] = useState(INITIAL_FORM);
    const [products, setProducts] = useState<IProduct[]>([]);
    const statusLabel: Record<string, string> = {
        AVAILABLE: "Estoque",
        ORDER: "Pedido",
    };

    useEffect(() => {
        StockService.getAll(token).then(r => setStocks(r))
        ProductService.getAll(token).then(p => setProducts(p))
    }, [refresh])

    async function handleCreate(){
    if(!form.productId || !form.quantity)return 
        await StockService.create(token, {
            idProduct: Number(form.productId),
            type: form.status,
            quantity: Number(form.quantity)
        })

        close()
        setRefresh(!refresh);    
    

        
    }

    const handleUpdate = (stock: Istock) => {
        let stockForUpdate = {
            id: stock.id,
            quantity: null,
            status: "AVAILABLE"
        }
         StockService.updateStock(token, stockForUpdate)
        setRefresh(!refresh);
    }



    return (
    <PageLayout 
        title= "Estoque"
        actions = {<button onClick={open}> + Novo Registro </button>}
    >

        {isOpen && (
            <Modal title="Novo Registro" onClose={close}
             footer= {
                <div>
                    <button className="btn-secondary" onClick={close}>Cancelar</button>
                    <button className="btn-primary" onClick={handleCreate}>Salvar</button>
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
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Total</th>
                    <th>Data</th>
                    <th>status</th>
                    <th>ações</th>
                </tr>
            </thead>
            <tbody>
            {stocks.map(stock => (
                <tr key={String(stock.id)}>
                    <td>{stock.id}</td>

                    <td>{stock.name}</td>
                    <td>{stock.Quantity}</td>
                    <td>{formatCurrency(stock.costPrice * stock.Quantity)}</td>
                    <td>{new Date(stock.createAt).toLocaleDateString("pt-BR")}</td>
                    <td>{statusLabel[stock.status]}</td>
                    {stock.status === "ORDER" ? (
                    <td style={{ position: "relative" }}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="btnActions">
                            ···
                        </button>

                        {isDropdownOpen && (
                            <div className= "dropdownCard">
                                <p className="dropdownBtn" onClick={() => handleUpdate(stock)}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                                    Recebido
                                </p>
                            </div>
                        )}
                    </td>
                    ) : (
                        <td></td>
                    )}
                </tr>

            ))}
            </tbody>
        </table>
    </PageLayout>)
}