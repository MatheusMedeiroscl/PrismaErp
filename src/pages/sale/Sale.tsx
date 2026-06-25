import { useEffect, useState } from "react";

import "../../style/Sale.css";
import { useAuth } from "../../shared/context/AuthContext";
import type { IClient, IProduct, ISale } from "../../shared/utils/Models";
import { useModal } from "../../shared/hooks/Modal";
import { SaleService } from "../../shared/services/SaleService";
import { ProductService } from "../../shared/services/ProductService";
import { ClientService } from "../../shared/services/ClientService";
import { PageLayout } from "../../shared/layout/PageLayout";
import { TableLayout } from "../../components/Table";
import { PAYMENT_COLOR, STATUS_COLOR } from "../../shared/utils/Colors";
import { fmtDate, formatCurrency, PaymentStatus, statusLabel } from "../../shared/utils/Format";
import { Modal } from "../../components/Modal";
import { SearchSelect } from "../../components/SearchSelect";

const INITAL_FORM = {
  clientID: 0,
  status: "PENDING",
  method: "PIX",
  dueDate: "",
  items: [],
};

interface IFormItem {
  productId: number;
  productName: string;
  salePrice: number;
  quantity: number;
}

type ViewMode = "client" | "product";

export function SalePage() {
  const { token } = useAuth();
  const [sales, setSales] = useState<ISale[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [form, setForm] = useState(INITAL_FORM);
  const { open, close, isOpen } = useModal();
  const [view, setView] = useState<ViewMode>("client");
  const [formItems, setFormItems] = useState<IFormItem[]>([]);

  useEffect(() => {
    SaleService.getAll(token).then((data) => setSales(data));
    ProductService.getAll(token).then((p) => setProducts(p));
    ClientService.getAll(token).then((c) => setClients(c));
  }, [token]);

async function handleCreate() {
  if (!selectedClientId) return;
  if (formItems.length === 0) return;

  const payload: {
    clientID: number,
    status: string,
    method: string,
    dueDate: string,
    items: Array<{ productId: number, quantity: number, salePrice: number }>
  } = {
    clientID: selectedClientId,
    status: form.status,
    method: form.method,
    dueDate: form.dueDate,
    items: formItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      salePrice: item.salePrice,
    }))
  }

  await SaleService.create(token, payload)
  setForm(INITAL_FORM)
  close()
  SaleService.getAll(token).then(setSales)
}

  function updateFormItem(
    index: number,
    field: keyof IFormItem,
    value: string | number,
  ) {
    setFormItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function removeFormItem(index: number) {
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addEmptyItem() {
    setFormItems((prev) => [
      ...prev,
      { productId: 0, productName: "", salePrice: 0, quantity: 1 },
    ]);
  }

  function calcTotal() {
    return formItems.reduce(
      (acc, item) => acc + item.quantity * item.salePrice,
      0,
    );
  }

  // Achata sales + items para a visão por produto
  const productRows = sales.flatMap((sale) =>
    sale.items.map((item) => ({ ...item, sale })),
  );

  const toggleButton = (
    <div className="toggleArea">
      <button
        onClick={() => setView("client")}
        className="toggleBtn"
        style={{
          background: view === "client" ? "#f0f0f0" : "transparent",
          fontWeight: view === "client" ? 500 : 400,
        }}
      >
        Por cliente
      </button>
      <button
        onClick={() => setView("product")}
        className="toggleBtn"
        style={{
          background: view === "product" ? "#f0f0f0" : "transparent",
          fontWeight: view === "product" ? 500 : 400,
        }}
      >
        Por produto
      </button>
    </div>
  );



  return (
    <PageLayout
      title="Análise de Vendas"
      actions={
        <>
          <button className="btn-primary" onClick={open}>
            + Venda
          </button>
        </>
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        {toggleButton}
      </div>

      {view === "client" && (
        <TableLayout
          title="Vendas"
          headers={
            <><th>#</th><th>Cliente</th><th>Dt venda</th><th>Status</th><th>Pagamento</th><th>Qtd</th><th>Total</th><th>Vencimento</th></>
          }
        >
          {sales.map((sale) => {
            const color = STATUS_COLOR[sale.saleStatus] || "#888";
            const paymentColor = PAYMENT_COLOR[sale.paymentMethod] || "#888";

            return (
              <tr key={sale.id}>
                <td>{sale.id}</td>
                <td>{sale.client}</td>
                <td>{fmtDate(sale.creatAt)}</td>
                <td><span className="status-badge" style={{ background: color + "22", color }}>
                    {statusLabel[sale.saleStatus]}
                    </span>
                </td>
                <td><span className="status-badge" 
                    style={{
                      background: paymentColor + "22",
                      color: paymentColor,
                    }}
                  >
                    {PaymentStatus[sale.paymentMethod]}
                  </span>
                </td>
                <td>{sale.totalQuantity}</td>
                <td>{formatCurrency(sale.totalCash)}</td>
                <td>{fmtDate(sale.dueDate)}</td>
              </tr>
            );
          })}
        </TableLayout>
      )}
      {view === "product" && (
        <TableLayout
          title="Produtos Vendidos"
          headers={
            <><th>#</th><th>Produto</th><th>Categoria</th><th>Dt Venda</th><th>Quantidade</th><th>R$ Unitário</th><th>R$ Total</th><th>Status</th></>}
        >
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
                  <span
                    className="status-badge"
                    style={{ background: color + "22", color }}
                  >
                    {statusLabel[row.sale.saleStatus]}
                  </span>
                </td>
              </tr>
            );
          })}
        </TableLayout>
      )}

      {isOpen && (
        <Modal
          title="Adicionar Venda"
          onClose={close}
          footer={
            <>
              <button className="btn-secondary" onClick={close}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleCreate}
                >
                Salvar
              </button>
            </>
          }
        >
          {/* Cliente */}
          <label className="modal-label">Cliente</label>
          <select
            className="modal-input"
            value={selectedClientId ?? ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedClientId(id);
              setForm((f) => ({ ...f, clientID: id }));
            }}
          >
            <option value="" disabled>
              Selecione um cliente
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.storeName} — {client.owner}
              </option>
            ))}
          </select>

          <div className="modal-now">
            {/* Produtos */}
            <label className="modal-label" style={{ marginTop: 12 }}>
              Produtos
            </label>

            {/* Cabeçalho das colunas */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 72px 96px 28px",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 11, color: "#6b7280" }}>Produto</span>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Qtd</span>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Vlr Unit.</span>
              <span />
            </div>

            {/* Linhas de item */}
            {formItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 72px 96px 28px",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <SearchSelect
                  options={products.map((p) => p.name)}
                  value={item.productName}
                  onChange={(name) => {
                    const product = products.find((p) => p.name === name);
                    if (!product) return;
                    updateFormItem(i, "productId", product.id);
                    updateFormItem(i, "productName", product.name);
                    updateFormItem(i, "salePrice", product.salePrice);
                  }}
                  placeholder="Buscar produto..."
                />
                <input
                  className="modal-input"
                  style={{ margin: 0 }}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateFormItem(i, "quantity", Number(e.target.value))
                  }
                />
                <input
                  className="modal-input"
                  style={{ margin: 0 }}
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.salePrice || ""}
                  onChange={(e) =>
                    updateFormItem(i, "salePrice", Number(e.target.value))
                  }
                />
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: 18,
                    padding: 0,
                    lineHeight: 1,
                  }}
                  onClick={() => removeFormItem(i)}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              className="btn-ghost"
              onClick={addEmptyItem}
              style={{ marginBottom: 12 }}
            >
              + Adicionar produto
            </button>

            {/* Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 8,
                paddingTop: 8,
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <span style={{ fontSize: 13, color: "#6b7280" }}>Total:</span>
              <span style={{ fontSize: 16, fontWeight: 500 }}>
                {formatCurrency(calcTotal())}
              </span>
            </div>
          </div>

          <div className="modal-row">
            <div>
              <label className="modal-label">Tipo</label>
              <select
                className="modal-input"
                value={form?.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="PENDING">A Receber</option>
                <option value="PAID">Recebido</option>
                <option value="RESERVED">Pedido</option>
              </select>
            </div>
            <div>
              <label className="modal-label">Pagamento</label>
              <select
                className="modal-input"
                value={form?.method}
                onChange={(e) =>
                  setForm((f) => ({ ...f, method: e.target.value }))
                }
              >
                <option value="PIX">pix</option>
                <option value="CASH">Dinheiro</option>
                <option value="BANK_SLIP">Boleto</option>
              </select>
            </div>
          </div>
          <div className="modal-now">
            <label className="modal-label">Data de Pagamento</label>
            <input
              className="modal-input"
              type="date"
              placeholder="today"
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: e.target.value }))
              }
            />
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}
