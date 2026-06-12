import { useEffect, useState } from "react";
import { useModal } from "../shared/hooks/Modal";
import { ProductService } from "../shared/services/ProductService";
import { useAuth } from "../shared/context/AuthContext";
import { TableLayout } from "../components/Table";
import { FilterPopover } from "../components/Filter";
import { Modal } from "../components/Modal";

import "../style/catalog.css";
import CurrencyInput from "react-currency-input-field";
import type { IProduct } from "../shared/utils/Models";


const INITIAL_FILTER = { name: "", category: "" };
const INITIAL_PRODUCT = {
  id: 0,
  name: "",
  category: "",
  costPrice: "",
  salePrice: "",
};

export function ProductCatalog() {
  const { token } = useAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(INITIAL_PRODUCT);
  const [refresh, setRefresh] = useState(false);
  const { isOpen, open, close } = useModal();
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    product: IProduct;
  } | null>(null);

  useEffect(() => {
    ProductService.getAll(token).then((p) => setProducts(p));
  }, [refresh]);

  const handleUpdate = async () => {
     await ProductService.update(selectedProduct.id, token, {
      name: selectedProduct.name.toUpperCase(),
      category: selectedProduct.category.toUpperCase(),
      costPrice: Number(selectedProduct.costPrice),
      salePrice: Number(selectedProduct.salePrice),
    });
    setSelectedProduct(INITIAL_PRODUCT);
    setRefresh(!refresh);
    close();
  }

  const handleDelete = async () => {
    await ProductService.delete(selectedProduct.id, token);

    setSelectedProduct(INITIAL_PRODUCT);
    setRefresh(!refresh);
    close();
  }

  const filterProducts = products.filter((p) => {
    const matchProdutoName =
      !filter.name || p.name.toLowerCase().includes(filter.name.toLowerCase());
    const matchProdutoCategory =
      !filter.category ||
      p.category.toLowerCase().includes(filter.category.toLowerCase());

    return matchProdutoName || matchProdutoCategory;
  });
  const hasFilter = !!filter.name;

  const handleDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    product: IProduct,
  ) => {
    if (dropdownPos) return setDropdownPos(null); // fecha se já está aberto
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom, left: rect.right - 160, product });
  };
  return (
    <>
      <TableLayout
        title="Produtos"
        filter={
          <FilterPopover
            hasFilter={hasFilter}
            onClear={() => setFilter(INITIAL_FILTER)}
            fields={[
              {
                label: "Produto",
                placeholder: "Nome do produto",
                value: filter.name,
                onChange: (v) => setFilter((f) => ({ ...f, produto: v })),
              },
              {
                label: "Categoria",
                placeholder: "Categoria do produto",
                value: filter.category,
                onChange: (v) => setFilter((f) => ({ ...f, produto: v })),
              },
            ]}
          />
        }
        headers={
          <>
            <th>#</th>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Preço Custo</th>
            <th>% Lucro</th>
            <th>Ações</th>
          </>
        }
      >
        {filterProducts.length === 0 ? (
          <tr>
            <td colSpan={6} className="empty-row">
              Nenhum resultado encontrado
            </td>
          </tr>
        ) : (
          filterProducts.map((product, i) => {
            const calcLucro =
              ((product.salePrice - product.costPrice) / product.costPrice) *
              100;

            return (
              <tr key={i}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.costPrice}</td>
                <td>{calcLucro.toFixed(2)}%</td>
                <td style={{ position: "relative" }}>
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      handleDropdown(e, product);
                      setSelectedProduct({
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        costPrice: String(product.costPrice),
                        salePrice: String(product.salePrice),
                      });
                    }}
                  >
                    ···
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </TableLayout>

      {dropdownPos && (
        <div
          className="dropdownCard"
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 1000,
          }}
        >
          <p
            className="dropdownBtn"
            onClick={() => {
              open();
              setDropdownPos(null);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            🟡 Editar
          </p>

          <p
            className="dropdownBtn"
            onClick={() => {
                handleDelete();
                setDropdownPos(null);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            🔴 Deletar
          </p>
        </div>
      )}

      {isOpen && (
        <Modal
          onClose={close}
          title="Editar Produto"
          footer={
            <>
              <button className="btn-secondary" onClick={close}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleUpdate}>
                Salvar
              </button>
            </>
          }
        >
          <>
            <label className="modal-label">Nome do Produto</label>
            <input
              className="modal-input"
              type="text"
              placeholder={selectedProduct.name}
              onChange={(e) =>
                setSelectedProduct((f) => ({ ...f, name: e.target.value }))
              }
            />

            <label className="modal-label">Categoria do Produto</label>
            <input
              className="modal-input"
              type="text"
              placeholder={selectedProduct.category}
              onChange={(e) =>
                setSelectedProduct((f) => ({ ...f, category: e.target.value }))
              }
            />

            <div className="modal-row">
              <div className="modal-field">
                <label className="modal-label">Preço de Custo</label>
                <CurrencyInput
                  className="modal-input"
                  placeholder="R$ 0,00"
                  decimalsLimit={2}
                  decimalScale={2}
                  fixedDecimalLength={2}
                  decimalSeparator=","
                  groupSeparator="."
                  prefix="R$ "
                  value={selectedProduct.costPrice}
                  onValueChange={(value) =>
                    setSelectedProduct((f) => ({
                      ...f,
                      costPrice: value || "",
                    }))
                  }
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Preço de Venda</label>
                <CurrencyInput
                  className="modal-input"
                  placeholder="R$ 0,00"
                  decimalsLimit={2}
                  decimalScale={2}
                  fixedDecimalLength={2}
                  decimalSeparator=","
                  groupSeparator="."
                  prefix="R$ "
                  value={selectedProduct.salePrice}
                  onValueChange={(value) =>
                    setSelectedProduct((f) => ({
                      ...f,
                      salePrice: value || "",
                    }))
                  }
                />
              </div>
            </div>
          </>
        </Modal>
      )}
    </>
  );
}
