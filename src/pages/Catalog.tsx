import { useEffect, useState } from "react";
import { useModal } from "../shared/hooks/Modal"
import { ProductService } from "../shared/services/ProductService";
import { useAuth } from "../shared/context/AuthContext";
import { PageLayout } from "../shared/layout/PageLayout";
import { TableLayout } from "../components/Table";
import { FilterPopover } from "../components/Filter";
import { Modal } from "../components/Modal";

import '../style/catalog.css'
import CurrencyInput from "react-currency-input-field";
import { currencyToNumber } from "../shared/utils/Format";

interface IProduct {
    id: number;
    name: string;
    category: string;
    costPrice: number;
    salePrice: number;
}

    const INITIAL_FILTER = {name: '', category: ''}
    const INITIAL_FORM = {name: '', category: '', costPrice: '', salePrice: ''}

export function CatalogPage() {
    const {token} = useAuth();
    const {open, close, isOpen} = useModal();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [refresh, setRefresh] = useState(false);
    const [filter, setFilter] = useState(INITIAL_FILTER);
    const [form, setForm] = useState(INITIAL_FORM);

    async function createProduct(){
        console.log(`Produto a ser criado: \n nome: ${form.name} \n preço custo: ${form.costPrice} \n preço venda: ${form.salePrice}`)
        if(form.name && form.costPrice){
            await ProductService.create(token, {
                name: form.name.toUpperCase(),
                category: form.category.toUpperCase(),
                costPrice: currencyToNumber(form.costPrice),
                salePrice: currencyToNumber(form.salePrice)
            });

            close();
            setRefresh(!refresh);
        }
    };


    useEffect(() => {
      ProductService.getAll(token).then(p => setProducts(p))
    }, [refresh])

    const filterProducts = products.filter(p => {
        const matchProdutoName = !filter.name || p.name.toLowerCase().includes(filter.name.toLowerCase());
        const matchProdutoCategory = !filter.category || p.category.toLowerCase().includes(filter.category.toLowerCase())

        return matchProdutoName || matchProdutoCategory
    })
  const hasFilter = !!(filter.name)    

    return (
        <PageLayout 
        title="Catálogo de Produtos"
        actions = {<button onClick={open} className="btn-primary"> + Novo Produto </button>}
        >
            <TableLayout
            title="Produtos"
            filter= {
                <FilterPopover 
                    hasFilter= {hasFilter}
                    onClear={() => setFilter(INITIAL_FILTER)}
                    fields={[
                        { label: 'Produto', placeholder: 'Nome do produto', value: filter.name, onChange: v => setFilter(f => ({ ...f, produto: v })) },
                        { label: 'Categoria', placeholder: 'Categoria do produto', value: filter.category, onChange: v => setFilter(f => ({ ...f, produto: v })) },
                    ]}
                />}

            headers={<>
            <th>ID</th><th>Produto</th><th>Categoria</th><th>Preço Custo</th><th>% Lucro</th><th>Ações</th>
            </>}
            >
        
                {filterProducts.length === 0
                    ? <tr><td colSpan={6} className="empty-row">Nenhum resultado encontrado</td></tr>
                    : filterProducts.map((product, i) => {
                        const calcLucro =  ((product.salePrice - product.costPrice) / product.costPrice) * 100;

                        return (
                            <tr key={i}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>{product.costPrice}</td>
                                <td>{calcLucro.toFixed(2)}%</td>
                                <td></td>
                            </tr>
                        )
                    })
                }
            </TableLayout>
            {isOpen && (
            <Modal
                title="Novo Produto"
                onClose={close}
                footer={
                    <div>
                        <button className="btn-secondary" onClick={close}>Cancelar</button>
                        <button className="btn-primary" onClick={createProduct}>Salvar</button>
                    </div>
                }
                >
                <label className="modal-label">Nome do Produto</label>
                <input className="modal-input" type="text" placeholder="..." value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value}))} />

                <label className="modal-label">Categoria do Produto</label>
                <input className="modal-input" type="text" placeholder="..." value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value}))} />
              
                <div className="modal-row">
                    <div className="modal-field">
                        <label className="modal-label">Preço de Custo</label>
                        <CurrencyInput className="modal-input" placeholder="R$ 0,00" 
                            decimalsLimit={2} decimalScale={2} fixedDecimalLength={2}
                            decimalSeparator="," groupSeparator="." prefix="R$ "
                            value={form.costPrice} onValueChange={(value) => setForm(f => ({...f, costPrice: value || ""}))}
                        />
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">Preço de Venda</label>
                        <CurrencyInput className="modal-input" placeholder="R$ 0,00" 
                            decimalsLimit={2} decimalScale={2} fixedDecimalLength={2}
                            decimalSeparator="," groupSeparator="." prefix="R$ "
                            value={form.salePrice} onValueChange={(value) => setForm(f => ({...f, salePrice: value || ""}))}
                        />
                    </div>
                </div>
            </Modal>
            )}


        </PageLayout>
    )
}