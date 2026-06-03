import { useEffect, useState } from "react";
import { useAuth } from "../shared/context/AuthContext"
import { SaleService } from "../shared/services/SaleService";
import { PageLayout } from "../shared/layout/PageLayout";
import { TableLayout } from "../components/Table";
import { fmtDate, formatCurrency } from "../shared/utils/Format";

interface ISaleItem {
    id: number;
    product: string;
    category: string;
    quantity: number;
    salePrice: number;
    createdAt: string;
}

interface ISale {
    id: number;
    client: string;
    creatAt: string;
    paymentMethod: string;
    saleStatus: string;
    dueDate: string;
    totalQuantity: number;
    totalCash: number;
    items: ISaleItem[];
}

type ViewMode = "client" | "product";

export function SalePage(){
    const {token} = useAuth();
    const [sales, setSales] = useState<ISale[]>([]);
    const [view, setView] = useState<ViewMode>("client");

    useEffect(() => {
        SaleService.getAll(token).then((data) => setSales (data))
    }, [token])

    // Achata sales + items para a visão por produto
    const productRows = sales.flatMap((sale) =>
        sale.items.map((item) => ({ ...item, sale }))
    );

        // Botão de toggle de visão — vai no header da TableLayout via prop se ela aceitar, senão fica acima
    const toggleButton = (
        <div style={{ display: "flex", gap: 0, border: "0.5px solid #ccc", borderRadius: 8, overflow: "hidden" }}>
            <button
                onClick={() => setView("client")}
                style={{
                    padding: "6px 16px",
                    fontSize: 13,
                    background: view === "client" ? "#f0f0f0" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: view === "client" ? 500 : 400,
                }}
            >
                Por cliente
            </button>
            <button
                onClick={() => setView("product")}
                style={{
                    padding: "6px 16px",
                    fontSize: 13,
                    background: view === "product" ? "#f0f0f0" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: view === "product" ? 500 : 400,
                }}
            >
                Por produto
            </button>
        </div>
    );

    return(
    <PageLayout title="Análise de Vendas">

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        {toggleButton}
        </div>

       {view === "client" && (
        <TableLayout
            title="Vendas"
            headers= {
                <>
                 <th>#</th> <th>Cliente</th> <th>Dt venda</th> <th>Status</th> <th>Pagamento</th> <th>Qtd</th> <th>Total</th> <th>Vencimento</th>
                </>
            }
        >
            {sales.map((sale) => (
                <tr key={sale.id}>
                    <td>{sale.id}</td>
                    <td>{sale.client}</td>
                    <td>{fmtDate(sale.creatAt)}</td>
                    <td> {sale.saleStatus}</td>
                    <td>{sale.paymentMethod}</td>
                    <td>{sale.totalQuantity}</td>
                    <td>{formatCurrency(sale.totalCash)}</td>
                    <td>{fmtDate(sale.dueDate)}</td>
                </tr>
            ))}
        </TableLayout>
       )}
       {view === "product" && (
        <TableLayout
            title="Produtos Vendidos"
            headers={
                <>
                    <th>#</th><th>Produto</th><th>Categoria</th><th>Dt Venda</th><th>Quantidade</th><th>R$ Unitário</th><th>R$ Total</th><th>Status</th>
                </>
            }
        >
            {productRows.map((row, i) => (
                <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{row.product}</td>
                    <td>{row.category}</td>
                    <td>{fmtDate(row.sale.creatAt)}</td>
                    <td>{row.quantity}</td>
                    <td>{formatCurrency(row.salePrice)}</td>
                    <td>{formatCurrency(row.quantity * row.salePrice)}</td>
                    <td>{row.sale.saleStatus}</td>                    
                </tr>
            ))}

        </TableLayout>
       )}

    </PageLayout>
    )
}