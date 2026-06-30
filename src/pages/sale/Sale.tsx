import { useEffect, useState } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import { PageLayout } from "../../shared/layout/PageLayout";
import { formatCurrency } from "../../shared/utils/Format";
import { useModal } from "../../shared/hooks/Modal";
import { Modal } from "../../components/Modal";
import {
  type IClient,
  type IProduct,
  type ISale,
} from "../../shared/utils/Models";

import { SearchSelect } from "../../components/SearchSelect";

import "../../style/Sale.css";
import { SaleTable } from "./SaleTable";
import { Services } from "../../shared/services/Services";

const INITIAL_FORM = {
  clientID: 0,
  status: "PENDING",
  method: "PIX",
  dueDate: "",
  items: [] as never[],
};

interface IFormItem {
  productId: number;
  productName: string;
  salePrice: number;
  quantity: number;
}

export function SalePage() {
  const { token } = useAuth();
  const [sales, setSales] = useState<ISale[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const { open, close, isOpen } = useModal();
  const [formItems, setFormItems] = useState<IFormItem[]>([]);

  useEffect(() => {
    Services.getAll(token, "sale").then((data) => setSales(data));
    Services.getAll(token, "product").then((p) => setProducts(p));
    Services.getAll(token, "client").then((c) => setClients(c));
  }, [token]);

  async function handleCreate() {
    if (!selectedClientId) return;
    if (formItems.length === 0) return;

    const payload: {
      clientID: number;
      status: string;
      method: string;
      dueDate: string;
      items: Array<{ productId: number; quantity: number; salePrice: number }>;
    } = {
      clientID: selectedClientId,
      status: form.status,
      method: form.method,
      dueDate: form.dueDate,
      items: formItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        salePrice: item.salePrice,
      })),
    };

    await Services.create(token,"sale" ,payload);
    setForm(INITIAL_FORM);
    close();
    Services.getAll(token, "sale").then(setSales);
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

  return (
    <PageLayout
      title="Análise de Vendas"
      actions={
        <button className="btn-primary" onClick={open}>
          + Venda
        </button>
      }
    >
      <SaleTable sales={sales} />

      {isOpen && (
        <Modal
          title="Adicionar Venda"
          onClose={close}
          footer={
            <>
              <button className="btn-secondary" onClick={close}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleCreate}>
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

          {/* Produtos */}
          <div className="modal-now">
            <label className="modal-label sale-items-label">Produtos</label>

            {/* Cabeçalho das colunas */}
            <div className="sale-items-header">
              <span className="sale-items-header__col">Produto</span>
              <span className="sale-items-header__col">Qtd</span>
              <span className="sale-items-header__col">Vlr Unit.</span>
              <span />
            </div>

            {/* Linhas de item */}
            {formItems.map((item, i) => (
              <div key={i} className="sale-item-row">
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
                  className="modal-input sale-item-row__input"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateFormItem(i, "quantity", Number(e.target.value))
                  }
                />
                <input
                  className="modal-input sale-item-row__input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.salePrice || ""}
                  onChange={(e) =>
                    updateFormItem(i, "salePrice", Number(e.target.value))
                  }
                />
                <button
                  className="sale-item-row__remove"
                  onClick={() => removeFormItem(i)}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              className="btn-ghost sale-add-item-btn"
              onClick={addEmptyItem}
            >
              + Adicionar produto
            </button>

            {/* Total */}
            <div className="sale-total">
              <span className="sale-total__label">Total:</span>
              <span className="sale-total__value">
                {formatCurrency(calcTotal())}
              </span>
            </div>
          </div>

          {/* Status e Pagamento */}
          <div className="modal-row">
            <div>
              <label className="modal-label">Tipo</label>
              <select
                className="modal-input"
                value={form.status}
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
                value={form.method}
                onChange={(e) =>
                  setForm((f) => ({ ...f, method: e.target.value }))
                }
              >
                <option value="PIX">Pix</option>
                <option value="CASH">Dinheiro</option>
                <option value="BANK_SLIP">Boleto</option>
              </select>
            </div>
          </div>

          {/* Data de pagamento */}
          <div className="modal-now">
            <label className="modal-label">Data de Pagamento</label>
            <input
              className="modal-input"
              type="date"
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