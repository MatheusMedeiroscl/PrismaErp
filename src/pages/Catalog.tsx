import { useEffect, useState } from "react";
import { PageLayout } from "../shared/layout/PageLayout";
import { ProductCatalog } from "../components/ProductCatalog";
import { ClientCatalog } from "../components/ClientCatalog";
import { useModal } from "../shared/hooks/Modal";
import { Modal } from "../components/Modal";
import CurrencyInput from "react-currency-input-field";
import { ProductService } from "../shared/services/ProductService";
import { useAuth } from "../shared/context/AuthContext";
import { currencyToNumber } from "../shared/utils/Format";
import { ClientService } from "../shared/services/ClientService";

const Pages = [
    {
        "id": "Produto",
        title: "Catálogo de Produto",
        component: ProductCatalog,

    },
    {
        "id": "Cliente",
        title: "Catálogo de Clientes",
        component: ClientCatalog,
    }]


    const INITIAL_PRODUCT_FORM = {
        name: '',
        category: '',
        costPrice: '',
        salePrice: ''
    };

    const INITIAL_CLIENT_FORM = {
        storeName: '',
        owner: '',
        email: '',
        cnpj: '',
        address: ''
    };


export function CatalogPage() {
    const {token} = useAuth();
    const [refresh, setRefresh] = useState(0);
    const [pageIndex, setPageIndex] = useState(0)
    const {open, close, isOpen} = useModal();
    const page = Pages[pageIndex];
    const Component = page.component;

    const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);

    const [clientForm, setClientForm] = useState(INITIAL_CLIENT_FORM);

    async function handleSave() {
        if(page.id === "Produto"){
            await ProductService.create(token, {
                name: productForm.name.toUpperCase(),
                category: productForm.category.toUpperCase(),
                costPrice: currencyToNumber(productForm.costPrice),
                salePrice: currencyToNumber(productForm.salePrice)
            });

            setProductForm(INITIAL_PRODUCT_FORM)

        }

        if(page.id === "Cliente"){
            await ClientService.create(token, {
                storeName: clientForm.storeName.toUpperCase(),
                owner: clientForm.owner.toUpperCase(), 
                email: clientForm.email.toUpperCase(),
                cnpj: clientForm.cnpj.toUpperCase(), 
                address: clientForm.address.toUpperCase(), 
            });

            setClientForm(INITIAL_CLIENT_FORM)
        }
            setRefresh(r => r + 1 );
            close()
    }

    return (
    <PageLayout
        title= {page.title}
        actions= {<>
            <button  className="btn-primary" onClick={open}> + {page.id} </button>
        </>}
    >
    <section>
        <button
            className={pageIndex === 0 ? "btn-primary" : "btn-secondary"}
            onClick={() => setPageIndex(0)}
        >
            Produtos
        </button>

        <button
            className={pageIndex === 1 ? "btn-primary" : "btn-secondary"}
            onClick={() => setPageIndex(1)}
        >
            Clientes
        </button>
    </section>

        <Component key={refresh}/>

{isOpen && (
    <Modal
        onClose={close}
        title={page.title}
        footer= {<>
            <button className="btn-secondary" onClick={close}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave}>Adicionar</button>
            </>}
    >
        {page.id === "Produto" && (
            <>
              <label className="modal-label">Nome do Produto</label>
                <input className="modal-input" type="text" placeholder="..." value={productForm.name}
                onChange={e => setProductForm(f => ({ ...f, name: e.target.value}))} />

                <label className="modal-label">Categoria do Produto</label>
                <input className="modal-input" type="text" placeholder="..." value={productForm.category}
                onChange={e => setProductForm(f => ({ ...f, category: e.target.value}))} />
              
                <div className="modal-row">
                    <div className="modal-field">
                        <label className="modal-label">Preço de Custo</label>
                        <CurrencyInput className="modal-input" placeholder="R$ 0,00" 
                            decimalsLimit={2} decimalScale={2} fixedDecimalLength={2}
                            decimalSeparator="," groupSeparator="." prefix="R$ "
                            value={productForm.costPrice} onValueChange={(value) => setProductForm(f => ({...f, costPrice: value || ""}))}
                        />
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">Preço de Venda</label>
                        <CurrencyInput className="modal-input" placeholder="R$ 0,00" 
                            decimalsLimit={2} decimalScale={2} fixedDecimalLength={2}
                            decimalSeparator="," groupSeparator="." prefix="R$ "
                            value={productForm.salePrice} onValueChange={(value) => setProductForm(f => ({...f, salePrice: value || ""}))}
                        />
                    </div>
                </div>  
            </>
        )}

        {page.id === "Cliente" && (
            <>
                <label className="modal-label">Nome da Loja</label>
                    <input className="modal-input" type="text" placeholder="..." value={clientForm.storeName}
                    onChange={e => setClientForm(f => ({ ...f, storeName: e.target.value}))} />

                    <label className="modal-label">Nome do Responsável</label>
                    <input className="modal-input" type="text" placeholder="..." value={clientForm.owner}
                    onChange={e => setClientForm(f => ({ ...f, owner: e.target.value}))} />

                    <label className="modal-label">Email de contato</label>
                    <input className="modal-input" type="text" placeholder="..." value={clientForm.email}
                    onChange={e => setClientForm(f => ({ ...f, email: e.target.value}))} />
                    <label className="modal-label">CNPJ</label>
                    <input className="modal-input" type="text" placeholder="..." value={clientForm.cnpj}
                    onChange={e => setClientForm(f => ({ ...f, cnpj: e.target.value}))} />

                    <label className="modal-label">Endereço</label>
                    <input className="modal-input" type="text" placeholder="..." value={clientForm.address}
                    onChange={e => setClientForm(f => ({ ...f, address: e.target.value}))} />
            
                </>
        )}
    </Modal>
)}
    </PageLayout>)
}