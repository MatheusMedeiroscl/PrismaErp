export function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export const statusLabel: Record<string, string> = {
  AVAILABLE: "Estoque",
  ORDER: "Pedido",
};

export function currencyToNumber(value: string): number {
    return parseFloat(
        value
            .replace(/\./g, "")
            .replace(",", ".")
    );
}