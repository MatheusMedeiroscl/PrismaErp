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
import { useModal } from "../../shared/hooks/Modal";
import { Modal } from "../../components/Modal";
import { EditSaleModal } from "./EditSaleModal";

interface SaleTableClientProps {
  sales: ISale[];
  onReload: () => void; 
}




function editModal(){
 const {open, close, isOpen} = useModal();
return (<>
  <Modal
   title="Editar Venda"
   onClose={close}>

    <p>test</p>
  </Modal>


</>

)

}

function SaleRow({ sale, onReload}: { sale: ISale; onReload: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { open, close, isOpen } = useModal();

  const color = STATUS_COLOR[sale.saleStatus] || "#888";
  const paymentColor = PAYMENT_COLOR[sale.paymentMethod] || "#888";

  return (
    <>
      <EditSaleModal
      sale={sale}
      isOpen={isOpen}
      onClose={close}
      onUpdated={onReload}  // sua função de reload
      onDeleted={onReload}
  />

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
                <div className="actions-bar">
                  <button
                    className="btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      open();
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="sale-row-detail__close"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(false);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <table className="sale-row-detail__table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Qtd</th>
                      <th>R$ Unitário</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.product}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.salePrice)}</td>
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
    </>
  );
}
export function SaleTable({ sales, onReload }: SaleTableClientProps) {
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
        <SaleRow key={sale.id} sale={sale} onReload = {onReload} />
      ))}
    </TableLayout>
  );
}