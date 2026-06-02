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

export function formatCnpj(value: string): string {
    const cnpj = value.replace(/\D/g, "");

    return cnpj
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 18);
}
