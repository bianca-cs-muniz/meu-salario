// Todo valor trafega em centavos (inteiro). Reais só na exibição.

const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarDinheiro(centavos: number): string {
  return formatador.format(centavos / 100);
}

/** "R$ 1.234,56" sem o sinal negativo, para quando o contexto já diz se é negativo. */
export function formatarAbsoluto(centavos: number): string {
  return formatarDinheiro(Math.abs(centavos));
}

/** Para preencher um campo de edição: 4590 → "45,90". */
export function centavosParaTexto(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Converte o que a pessoa digitou em centavos.
 * Aceita "45", "45,9", "45,90", "45.90", "1.234,56", "R$ 1.234,56".
 * Devolve null quando não dá para entender.
 */
export function textoParaCentavos(texto: string): number | null {
  let s = String(texto ?? "").trim().replace(/[R$\s]/g, "");
  if (!s) return null;
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if ((s.match(/\./g) ?? []).length > 1 || /\.\d{3}$/.test(s)) {
    // "1.234" ou "1.234.567": pontos são separadores de milhar
    s = s.replace(/\./g, "");
  }
  const valor = Number(s);
  if (!Number.isFinite(valor)) return null;
  return Math.round(valor * 100);
}

export function porcentagem(parte: number, total: number): number {
  if (!total) return 0;
  return (parte / total) * 100;
}
