import type { ISale } from "../../shared/utils/Models";
import { TableLayout } from "../../components/Table";
import { fmtDate, formatCurrency, statusLabel } from "../../shared/utils/Format";
import { STATUS_COLOR } from "../../shared/utils/Colors";

interface SaleTableProductProps {
  sales: ISale[];
}

export function SaleTableProduct({ sales }: SaleTableProductProps) {
  const productRows = sales.flatMap((sale) =>
    sale.items.map((item) => ({ ...item, sale })),
  );

  return (
    <TableLayout
      title="Produtos Vendidos"
      headers={
        <>
          <th>#</th>
          <th>Produto</th>
          <th>Categoria</th>
          <th>Dt Venda</th>
          <th>Quantidade</th>
          <th>R$ Unitário</th>
          <th>R$ Total</th>
          <th>Status</th>
        </>
      }
    >
      <tbody>
        {productRows.map((row, i) => {
          const color = STATUS_COLOR[row.sale.saleStatus] || "#888";
          return (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{row.product}</td>
              <td>{row.category}</td>
              <td>{fmtDate(row.sale.creatAt)}</td>
              <td>{row.quantity}</td>
              <td>{formatCurrency(row.salePrice)}</td>
              <td>{formatCurrency(row.quantity * row.salePrice)}</td>
              <td>
                <span className="status-badge" style={{ background: color + "22", color }}>
                  {statusLabel[row.sale.saleStatus]}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </TableLayout>
  );
}