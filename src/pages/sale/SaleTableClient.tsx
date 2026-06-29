import { useState } from "react";
import type { ISale } from "../../shared/utils/Models";
import { TableLayout } from "../../components/Table";
import {
  fmtDate,
  formatCurrency,
  PaymentStatus,
  statusLabel,
} from "../../shared/utils/Format";
import { PAYMENT_COLOR, STATUS_COLOR } from "../../shared/utils/Colors";

interface SaleTableClientProps {
  sales: ISale[];
}

function SaleRow({ sale }: { sale: ISale }) {
  const [expanded, setExpanded] = useState(false);
  const color = STATUS_COLOR[sale.saleStatus] || "#888";
  const paymentColor = PAYMENT_COLOR[sale.paymentMethod] || "#888";

  return (
    <tbody>
      <tr className="sale-row" onClick={() => setExpanded((prev) => !prev)}>
        <td>{sale.id}</td>
        <td>{sale.client}</td>
        <td>{fmtDate(sale.creatAt)}</td>
        <td>
          <span className="status-badge" style={{ background: color + "22", color }}>
            {statusLabel[sale.saleStatus]}
          </span>
        </td>
        <td>
          <span className="status-badge" style={{ background: paymentColor + "22", color: paymentColor }}>
            {PaymentStatus[sale.paymentMethod]}
          </span>
        </td>
        <td>{sale.totalQuantity}</td>
        <td>{formatCurrency(sale.totalCash)}</td>
        <td>{fmtDate(sale.dueDate)}</td>
        <td className="sale-row__chevron">{expanded ? "▲" : "▼"}</td>
      </tr>

      <tr className={`sale-row-detail ${expanded ? "sale-row-detail--open" : ""}`}>
        <td colSpan={9} className="sale-row-detail__cell">
          <div className="sale-row-detail__inner">
            <div className="sale-row-detail__content">
              <button
                className="sale-row-detail__close"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
              >
                ✕
              </button>

              <table className="sale-row-detail__table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>R$ Unitário</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, i) => (
                    <tr key={i}>
                        <td>{item.category}</td>
                      <td>{item.product}</td>
                      <td>{item.quantity}</td>
                        <td>{console.log(item) as undefined || formatCurrency(item.salePrice)}</td>
                      <td>{formatCurrency(item.quantity * item.salePrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  );
}

export function SaleTableClient({ sales }: SaleTableClientProps) {
  return (
    <TableLayout
      title="Vendas"
      headers={
        <>
          <th>#</th> <th>Cliente</th> <th>Dt venda</th> <th>Status</th>
          <th>Pagamento</th> <th>Qtd</th> <th>Total</th> <th>Vencimento</th>
          <th />
        </>
      }
    >
      {sales.map((sale) => (
        <SaleRow key={sale.id} sale={sale} />
      ))}
    </TableLayout>
  );
}