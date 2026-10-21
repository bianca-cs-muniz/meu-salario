// Cálculos puros da edição de lançamentos (sem banco, sem alias).
import { cicloDoCartao, competenciaDe } from "../../shared/helpers/competencia.helper";

export type ItemEdicao = {
  competencia: string;
  formaPagamento: string;
  cartaoId: string | null;
  grupoParcelaId: string | null;
  recorrenciaId: string | null;
  mesRecorrencia: string | null;
};

export type NovoEdicao = {
  data: Date;
  /** Cartão do lançamento depois da edição (null fora do crédito). */
  cartao: { diaFechamento: number; diaVencimento: number } | null;
  cartaoId: string | null;
  /** A data foi enviada na edição deste item. */
  dataInformada: boolean;
};

/**
 * Competência de um lançamento depois da edição.
 * - Fora do crédito: gasto fixo fica no mês da cobrança (`mesRecorrencia`; mudar a data não muda o
 *   orçamento — o aluguel de outubro pago em 01/11 é de outubro); os demais seguem o mês da data.
 * - No crédito: parcela mantém a competência; os demais (inclusive gasto fixo) seguem o ciclo do
 *   cartão quando data, cartão ou forma mudam.
 */
export function competenciaNaEdicao(item: ItemEdicao, novo: NovoEdicao): string {
  if (!novo.cartao) return item.recorrenciaId ? item.mesRecorrencia ?? item.competencia : competenciaDe(novo.data);
  if (item.grupoParcelaId) return item.competencia;
  if (novo.dataInformada || novo.cartaoId !== item.cartaoId || item.formaPagamento !== "CREDITO")
    return cicloDoCartao(novo.data, novo.cartao.diaFechamento, novo.cartao.diaVencimento).competencia;
  return item.competencia;
}
