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

     

export function ProductCatalog(){
     
    const {token} = useAuth();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [refresh, setRefresh] = useState(false);
    const [filter, setFilter] = useState(INITIAL_FILTER);
   

    useEffect(() => {
      ProductService.getAll(token).then(p => setProducts(p))
    }, [refresh])

    const filterProducts = products.filter(p => {
        const matchProdutoName = !filter.name || p.name.toLowerCase().includes(filter.name.toLowerCase());
        const matchProdutoCategory = !filter.category || p.category.toLowerCase().includes(filter.category.toLowerCase())

        return matchProdutoName || matchProdutoCategory
    })
  const hasFilter = !!(filter.name) 



    return (<>
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
                    />
                }

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
     </>)
}