import { useEffect, useState } from "react";
import { useAuth } from "../shared/context/AuthContext";
import { PageLayout } from "../shared/layout/PageLayout";
import { formatCurrency } from "../shared/utils/Format";
import { Services } from "../shared/services/Services";
import { KpiCard } from "../components/Kpi";
import { BarChartCard } from "../components/BarChart.tsx";
import type { ISale, Istock } from "../shared/utils/Models";

// ─── helpers ────────────────────────────────────────────────────────────────

function getCurrentMonthSales(sales: ISale[]) {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return sales.filter((s) => s.creatAt?.startsWith(prefix));
}

function getWeekLabel(dateStr: string) {
  const day = new Date(dateStr).getDate();
  if (day <= 7)  return "Semana 1";
  if (day <= 14) return "Semana 2";
  if (day <= 21) return "Semana 3";
  return "Semana 4";
}

function getSalesByWeek(sales: ISale[], status: string[]) {
  const weeks: Record<string, number> = {
    "Semana 1": 0, "Semana 2": 0, "Semana 3": 0, "Semana 4": 0,
  };
  sales
    .filter((s) => status.includes(s.saleStatus))
    .forEach((s) => { weeks[getWeekLabel(s.creatAt)]++ });
  return Object.entries(weeks).map(([label, value]) => ({ label, value }));
}

function getInactiveClients(sales: ISale[]) {
  const map: Record<string, string> = {};
  sales.forEach((s) => {
    if (!map[s.client] || s.creatAt > map[s.client]) map[s.client] = s.creatAt;
  });
  return Object.entries(map)
    .map(([client, lastDate]) => ({
      client,
      days: Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => b.days - a.days)
    .slice(0, 5);
}

function getLowStock(stocks: Istock[]) {
  return stocks.filter((s) => s.quantity < 50 && s.status === "AVAILABLE");
}

function getTopProducts(sales: ISale[]) {
  const map: Record<string, number> = {};
  sales.forEach((s) =>
    s.items.forEach((item) => {
      map[item.product] = (map[item.product] || 0) + item.quantity;
    })
  );
  return Object.entries(map)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
}

// ─── component ──────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { token } = useAuth();
  const [sales, setSales] = useState<ISale[]>([]);
  const [stocks, setStocks] = useState<Istock[]>([]);

  useEffect(() => {
    Services.getAll(token, "sale").then(setSales);
    Services.getAll(token, "stock").then(setStocks);
  }, [token]);

  const monthSales = getCurrentMonthSales(sales);

  const kpis = [
    { label: "Vendas no Mês",     value: monthSales.length },
    { label: "Faturado",          value: formatCurrency(monthSales.filter(s => s.saleStatus === "PAID").reduce((acc, s) => acc + s.totalCash, 0)) },
    { label: "A Receber",         value: formatCurrency(monthSales.filter(s => s.saleStatus === "PENDING").reduce((acc, s) => acc + s.totalCash, 0)) },
    { label: "Itens Baixo Estoque", value: getLowStock(stocks).length },
  ];

  const paidByWeek    = getSalesByWeek(monthSales, ["PAID"]);
  const pendingByWeek = getSalesByWeek(monthSales, ["PENDING", "RESERVED"]);
  const inactiveClients = getInactiveClients(sales);
  const lowStock        = getLowStock(stocks);
  const topProducts     = getTopProducts(sales);

  return (
    <PageLayout title="Dashboard">

      {/* KPIs */}
      <div className="kpi-cards-row">
        {kpis.map((kpi) => (
          <KpiCard className="kpi-card" key={kpi.label} label={kpi.label} value={kpi.value} />
        ))}
      </div>

      {/* Gráficos */}
      <div className="dashboard-charts-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "16px 0" }}>
        <BarChartCard
          title="Vendas Pagas por Semana"
          data={paidByWeek}
          color="#22c55e"
        />
        <BarChartCard
          title="A Receber / Pedidos por Semana"
          data={pendingByWeek}
          color="#f59e0b"
        />
      </div>

      {/* Tabelas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

        {/* Clientes inativos */}
        <div className="table-card">
          <h3 className="chart-title">Perído de compra - por cliente</h3>
          <table className="data-table">
            <thead><tr><th>Cliente</th><th>Dias</th></tr></thead>
            <tbody>
              {inactiveClients.length === 0
                ? <tr><td colSpan={2} className="empty-row">Sem dados</td></tr>
                : inactiveClients.map((c, i) => (
                  <tr key={i}>
                    <td>{c.client}</td>
                    <td>{c.days} dias</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Estoque baixo */}
        <div className="table-card">
          <h3 className="chart-title">Estoque Abaixo de 50</h3>
          <table className="data-table">
            <thead><tr><th>Produto</th><th>Qtd</th></tr></thead>
            <tbody>
              {lowStock.length === 0
                ? <tr><td colSpan={2} className="empty-row">Tudo ok</td></tr>
                : lowStock.map((s, i) => (
                  <tr key={i}>
                    <td>{s.product}</td>
                    <td style={{ color: s.quantity < 20 ? "#ef4444" : "#f59e0b", fontWeight: 500 }}>
                      {s.quantity}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Produtos mais vendidos */}
        <div className="table-card">
          <h3 className="chart-title">Produtos Mais Vendidos</h3>
          <table className="data-table">
            <thead><tr><th>#</th><th>Produto</th><th>Qtd</th></tr></thead>
            <tbody>
              {topProducts.length === 0
                ? <tr><td colSpan={3} className="empty-row">Sem dados</td></tr>
                : topProducts.map((p, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.qty}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

      </div>
    </PageLayout>
  );
}