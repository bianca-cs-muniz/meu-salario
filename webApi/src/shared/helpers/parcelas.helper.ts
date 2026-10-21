import { deslocarCompetencia } from "./competencia.helper";

export type Parcela = { numero: number; total: number; descricao: string; valorCentavos: number; competencia: string };

/**
 * Divide uma compra em parcelas: valor inteiro (floor) em cada uma e o resto na 1ª;
 * descrição "X (k/n)"; competências a partir da primeira, uma por mês.
 */
export function dividirEmParcelas(descricao: string, valorCentavos: number, quantidade: number, primeiraCompetencia: string): Parcela[] {
  const total = Math.max(1, Math.floor(quantidade));
  const valorParcela = Math.floor(valorCentavos / total);
  const resto = valorCentavos - valorParcela * total;
  return Array.from({ length: total }, (_, indice) => {
    const numero = indice + 1;
    return {
      numero,
      total,
      descricao: total > 1 ? descricaoDaParcela(descricao, numero, total) : descricao,
      valorCentavos: valorParcela + (numero === 1 ? resto : 0),
      competencia: deslocarCompetencia(primeiraCompetencia, indice),
    };
  });
}

/** Tira um sufixo " (k/n)" que já exista e coloca o da parcela informada. */
export function descricaoDaParcela(descricao: string, numero: number, total: number): string {
  return `${descricao.replace(/ \(\d+\/\d+\)$/, "")} (${numero}/${total})`;
}
