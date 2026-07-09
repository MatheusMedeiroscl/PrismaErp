import { useAuth } from "../shared/context/AuthContext";
import { PageLayout } from "../shared/layout/PageLayout";
import { Services } from "../shared/services/Services";

const EXPORTS = [
  { label: "Vendas por Cliente",  endpoint: "sale" },
  { label: "Vendas por Produto",  endpoint: "saleItems" },
  { label: "Estoque Atual",       endpoint: "stock" },
  { label: "Catálogo de Clientes", endpoint: "client" },
  { label: "Catálogo de Produtos", endpoint: "product" },
]

export function ExportsPage() {
  const { token } = useAuth()

  async function handleExport(endpoint: string, filename: string) {
    Services.export(token, endpoint , filename)
  }

  return (
    <PageLayout title="Exportações de Excel">
      <div className="btnList">
        {EXPORTS.map(({ label, endpoint }) => (
          <button
            key={endpoint}
            className="btn-primary"
            onClick={() => handleExport(endpoint, label)}
          >
            {label}
          </button>
        ))}
      </div>
    </PageLayout>
  )
}