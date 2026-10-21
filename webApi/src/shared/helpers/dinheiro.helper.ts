const CENTAVOS_INT_MIN = -2_147_483_648;
const CENTAVOS_INT_MAX = 2_147_483_647;

function validarCentavos(centavos: number): void {
  if (!Number.isInteger(centavos) || centavos < CENTAVOS_INT_MIN || centavos > CENTAVOS_INT_MAX) {
    throw new Error("Valor fora do intervalo suportado pelo banco de dados.");
  }
}

export function paraCentavos(valor: number): number {
  if (!Number.isFinite(valor)) throw new Error("Valor inválido.");
  const centavos = Math.round(valor * 100);
  validarCentavos(centavos);
  return centavos;
}

export function formatarDinheiro(centavos: number): string {
  validarCentavos(centavos);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos / 100);
}

export function parsearDinheiro(texto: string): number {
  let limpo = texto.trim().replace(/^R\$\s*/i, "").replace(/\s/g, "");
  if (limpo.includes(",")) {
    if (!/^-?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/.test(limpo)) throw new Error("Informe um valor monetário válido.");
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(?:\.\d{3})+$/.test(limpo)) {
    limpo = limpo.replace(/\./g, "");
  } else if (!/^-?\d+(?:\.\d{1,2})?$/.test(limpo)) {
    throw new Error("Informe um valor monetário válido.");
  }
  const centavos = Math.round(Number(limpo) * 100);
  validarCentavos(centavos);
  return centavos;
}

export function centavosParaReais(centavos: number): number {
  validarCentavos(centavos);
  return centavos / 100;
}
