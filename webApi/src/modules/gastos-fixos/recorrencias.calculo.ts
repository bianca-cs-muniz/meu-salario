// Cálculos puros da geração de gastos fixos (sem banco, sem alias).
import { cicloDoCartao, dataNaCompetencia, deslocarCompetencia } from "../../shared/helpers/competencia.helper";

export type RecorrenciaCalculo = { inicio: string; fim: string | null; geradaAte: string | null };

/**
 * Competências (meses da recorrência) que ainda faltam gerar:
 * de max(inicio, geradaAte + 1) até min(fim, atual + 1).
 */
export function competenciasAGerar(recorrencia: RecorrenciaCalculo, competenciaAtual: string): string[] {
  const depoisDaUltima = recorrencia.geradaAte ? deslocarCompetencia(recorrencia.geradaAte, 1) : recorrencia.inicio;
  const primeira = depoisDaUltima > recorrencia.inicio ? depoisDaUltima : recorrencia.inicio;
  const limite = deslocarCompetencia(competenciaAtual, 1);
  const ultima = recorrencia.fim && recorrencia.fim < limite ? recorrencia.fim : limite;
  const lista: string[] = [];
  for (let competencia = primeira; competencia <= ultima; competencia = deslocarCompetencia(competencia, 1)) lista.push(competencia);
  return lista;
}

/**
 * Data e competência do lançamento gerado para um mês da recorrência.
 * No crédito, a competência é a da fatura em que a compra cai (ciclo do cartão).
 * `mesRecorrencia` é sempre o próprio mês da recorrência (chave única com recorrenciaId).
 */
export function lancamentoDoMes(mes: string, diaDoMes: number, cartao: { diaFechamento: number; diaVencimento: number } | null) {
  const data = dataNaCompetencia(mes, diaDoMes);
  const competencia = cartao ? cicloDoCartao(data, cartao.diaFechamento, cartao.diaVencimento).competencia : mes;
  return { data, competencia, mesRecorrencia: mes };
}
