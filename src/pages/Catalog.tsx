import { useState } from "react";
import { PageLayout } from "../shared/layout/PageLayout";
import { ProductCatalog } from "../components/ProductCatalog";
import { ClientCatalog } from "../components/ClientCatalog";
import { useModal } from "../shared/hooks/Modal";

const Pages = [
    {
        "id": "Produto",
        title: "Catálogo de Produto",
        component: ProductCatalog,
        form: {name: '', category: '', costPrice: '', salePrice: ''}
    },
    {
        "id": "Cliente",
        title: "Catálogo de Clientes",
        component: ClientCatalog,
        form: {storeName: '', owner: '', cnpj: '', address: ''}


    }]


export function CatalogPage() {
    const [pageIndex, setPageIndex] = useState(0)
    const {open, close, isOpen} = useModal();
    const page = Pages[pageIndex]
    const Component = page.component;

    return (
    <PageLayout
        title= {page.title}
        actions= {<>
            <button onClick={open}> + {page.id} </button>
        </>}
    >
        <section>
            <button onClick={() => {setPageIndex(0)}}>Produtos</button>
            <button onClick={() => {setPageIndex(1)}}>Cliente</button>
        </section>

        <Component/>

    </PageLayout>)
}