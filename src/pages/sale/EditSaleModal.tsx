import { useState, useEffect } from "react";
import type { ISale, IClient, IProduct } from "../../shared/utils/Models";
import { Modal } from "../../components/Modal";
import { SearchSelect } from "../../components/SearchSelect";
import { formatCurrency } from "../../shared/utils/Format";
import { useAuth } from "../../shared/context/AuthContext";
import { Services } from "../../shared/services/Services";


interface EditSaleModalProps {
  sale: ISale;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

interface FormItem {
  productId: number;
  productName: string;
  quantity: number;
  salePrice: number;
}

export function EditSaleModal({ sale, isOpen, onClose, onUpdated, onDeleted }: EditSaleModalProps) {
  const { token } = useAuth();

  const [clients, setClients] = useState<IClient[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [form, setForm] = useState({
    clientID: 0,
    status: "",
    method: "",
    dueDate: "",
  });

  // Pré-popula o form com os dados da venda ao abrir
  useEffect(() => {
    if (!isOpen) return;

    Services.getAll(token, "client").then(setClients);
    Services.getAll(token, "product").then(setProducts);

    setForm({
      clientID: sale.clientId, // ISale não tem clientId, só client (string) — ajuste se seu backend retornar o id
      status: sale.saleStatus,
      method: sale.paymentMethod,
      dueDate: sale.dueDate?.slice(0, 10) ?? "",
    });

    setFormItems(
      sale.items.map((item) => ({
        productId: item.productId,
        productName: item.product,
        quantity: item.quantity,
        salePrice: item.salePrice,
      }))
    );
  }, [isOpen]);

  function addEmptyItem() {
    setFormItems((prev) => [...prev, { productId: 0, productName: "", quantity: 1, salePrice: 0 }]);
  }

  function removeFormItem(index: number) {
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFormItem<K extends keyof FormItem>(index: number, field: K, value: FormItem[K]) {
    setFormItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function calcTotal() {
    return formItems.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);
  }

  async function handleUpdate() {
    const payload = {
      clientID: selectedClientId,
      status: form.status,
      method: form.method,
      dueDate: form.dueDate,
      items: formItems.map(({ productId, quantity, salePrice }) => ({
        productId,
        quantity,
        salePrice,
      })),
    };

    try {
      await Services.update(token, "sale", sale.id, payload);
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar venda:", err);
    }
  }

  async function handleDelete() {
    try {
      await Services.delete(token, "sale", sale.id);
      onDeleted();
      onClose();
    } catch (err) {
      console.error("Erro ao deletar venda:", err);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal
      title="Editar Venda"
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-delete" onClick={handleDelete}>
            Deletar
          </button>

          <button className="btn-primary" onClick={handleUpdate}>
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
          {sale.client} {/* mostra o cliente atual como fallback visual */}
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

        <div className="sale-items-header">
          <span className="sale-items-header__col">Produto</span>
          <span className="sale-items-header__col">Qtd</span>
          <span className="sale-items-header__col">Vlr Unit.</span>
          <span />
        </div>

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
              onChange={(e) => updateFormItem(i, "quantity", Number(e.target.value))}
            />
            <input
              className="modal-input sale-item-row__input"
              type="number"
              min={0}
              step="0.01"
              value={item.salePrice || ""}
              onChange={(e) => updateFormItem(i, "salePrice", Number(e.target.value))}
            />
            <button className="sale-item-row__remove" onClick={() => removeFormItem(i)}>
              ×
            </button>
          </div>
        ))}

        <button className="btn-ghost sale-add-item-btn" onClick={addEmptyItem}>
          + Adicionar produto
        </button>

        <div className="sale-total">
          <span className="sale-total__label">Total:</span>
          <span className="sale-total__value">{formatCurrency(calcTotal())}</span>
        </div>
      </div>

      {/* Status e Pagamento */}
      <div className="modal-row">
        <div>
          <label className="modal-label">Tipo</label>
          <select
            className="modal-input"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
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
            onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
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
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
        />
      </div>
    </Modal>
  );
}