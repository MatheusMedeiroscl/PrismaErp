import { useEffect, useState } from "react";
import { useAuth } from "../shared/context/AuthContext";
import { PageLayout } from "../shared/layout/PageLayout";
import { fmtDate, formatCurrency } from "../shared/utils/Format";
import { Services } from "../shared/services/Services";
import { KpiCard } from "../components/Kpi";
import { BarChartCard } from "../components/BarChart";
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

function getSalesByWeekGrouped(sales: ISale[]) {
  const weeks: Record<string, { label: string; pagas: number; pagasValor: number; aReceber: number; aReceberValor: number }> = {
    "Semana 1": { label: "Semana 1", pagas: 0, pagasValor: 0, aReceber: 0, aReceberValor: 0 },
    "Semana 2": { label: "Semana 2", pagas: 0, pagasValor: 0, aReceber: 0, aReceberValor: 0 },
    "Semana 3": { label: "Semana 3", pagas: 0, pagasValor: 0, aReceber: 0, aReceberValor: 0 },
    "Semana 4": { label: "Semana 4", pagas: 0, pagasValor: 0, aReceber: 0, aReceberValor: 0 },
  };
  sales.forEach((s) => {
    const week = getWeekLabel(s.creatAt);
    if (s.saleStatus === "PAID") {
      weeks[week].pagas++;
      weeks[week].pagasValor += s.totalCash;
    }
    if (s.saleStatus === "PENDING" || s.saleStatus === "RESERVED") {
      weeks[week].aReceber++;
      weeks[week].aReceberValor += s.totalCash;
    }
  });
  return Object.values(weeks);
}

function getStockByWeek(stocks: Istock[]) {
  const weeks: Record<string, { label: string; disponiveis: number; pedidos: number }> = {
    "Semana 1": { label: "Semana 1", disponiveis: 0, pedidos: 0 },
    "Semana 2": { label: "Semana 2", disponiveis: 0, pedidos: 0 },
    "Semana 3": { label: "Semana 3", disponiveis: 0, pedidos: 0 },
    "Semana 4": { label: "Semana 4", disponiveis: 0, pedidos: 0 },
  };
  stocks.forEach((s) => {
    const week = getWeekLabel(s.createAt);
    if (s.status === "AVAILABLE") weeks[week].disponiveis += s.quantity;
    if (s.status === "ORDER")     weeks[week].pedidos += s.quantity;
  });
  return Object.values(weeks);
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

function getPendingClients(sales: ISale[]) {
  const today = new Date();
  return sales.filter((s) => s.saleStatus === "PENDING" && new Date(s.dueDate) < today);
}

function getLowStock(stocks: Istock[]) {
  return stocks.filter((s) => s.quantity < 100 && s.status === "AVAILABLE");
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

  const monthSales      = getCurrentMonthSales(sales);
  const inactiveClients = getInactiveClients(sales);
  const pendingClients  = getPendingClients(sales);
  const lowStock        = getLowStock(stocks);
  const topProducts     = getTopProducts(sales);

  const kpis = [
    { label: "Vendas no Mês",       value: monthSales.length },
    { label: "Faturado",            value: formatCurrency(monthSales.filter(s => s.saleStatus === "PAID").reduce((acc, s) => acc + s.totalCash, 0)) },
    { label: "A Receber",           value: formatCurrency(monthSales.filter(s => s.saleStatus === "PENDING").reduce((acc, s) => acc + s.totalCash, 0)) },
    { label: "Estoque Baixo",       value: lowStock.length },
  ];

  return (
    <PageLayout title="Dashboard">

      {/* KPIs */}
      <div className="kpi-cards-row">
        {kpis.map((kpi) => (
          <KpiCard className="kpi-card" key={kpi.label} label={kpi.label} value={kpi.value} />
        ))}
      </div>

      {/* Gráficos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "16px 0" }}>
        <BarChartCard
          title="Vendas por Semana"
          data={getSalesByWeekGrouped(monthSales)}
          series={[
            { dataKey: "pagasValor",    label: "Recebido",     color: "#22c55e", format: "currency" },
            { dataKey: "aReceberValor", label: "A Receber", color: "#f59e0b", format: "currency" },
          ]}
        />
        <BarChartCard
          title="Movimentação de Estoque por Semana"
          data={getStockByWeek(stocks)}
          series={[
            { dataKey: "disponiveis", label: "Disponível", color: "#3b82f6", format: "number" },
            { dataKey: "pedidos",     label: "Pedidos",    color: "#a855f7", format: "number" },
          ]}
        />
      </div>

      {/* Tabelas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>

        {/* Clientes inativos */}
        <div className="table-card">
          <h3 className="chart-title">Período de Compra</h3>
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

        {/* Pagamentos atrasados */}
        <div className="table-card">
          <h3 className="chart-title">Pagamentos Atrasados</h3>
          <table className="data-table">
            <thead><tr><th>Cliente</th><th>Vencimento</th><th>Total</th></tr></thead>
            <tbody>
              {pendingClients.length === 0
                ? <tr><td colSpan={3} className="empty-row">Sem dados</td></tr>
                : pendingClients.map((c, i) => (
                  <tr key={i}>
                    <td>{c.client}</td>
                    <td style={{ color: "#ef4444" }}>{fmtDate(c.dueDate)}</td>
                    <td>{formatCurrency(c.totalCash)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Estoque baixo */}
        <div className="table-card">
          <h3 className="chart-title">Estoque Abaixo dos 100</h3>
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