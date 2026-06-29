import { useState } from "react";
import type { ISale } from "../../shared/utils/Models";
import { SaleTableClient } from "./SaleTableClient";
import { SaleTableProduct } from "./SaleTableProduct";

interface SaleTableProps {
  sales: ISale[];
}

type ViewMode = "client" | "product";

export function SaleTable({ sales }: SaleTableProps) {
  const [view, setView] = useState<ViewMode>("client");

  const toggleButton = (
    <div className="toggleArea">
      <button
        onClick={() => setView("client")}
        className={`toggleBtn ${view === "client" ? "toggleBtn--active" : ""}`}
      >
        Por cliente
      </button>
      <button
        onClick={() => setView("product")}
        className={`toggleBtn ${view === "product" ? "toggleBtn--active" : ""}`}
      >
        Por produto
      </button>
    </div>
  );

  return (
    <>
      <div className="saleTable-toggleWrapper">
        {toggleButton}
      </div>

      {view === "client" && <SaleTableClient sales={sales} />}
      {view === "product" && <SaleTableProduct sales={sales} />}
    </>
  );
}