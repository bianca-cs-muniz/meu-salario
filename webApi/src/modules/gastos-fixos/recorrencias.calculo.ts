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

export type LancamentoFuturo = { data: Date; valorCentavos: number; competencia: string; mesRecorrencia: string | null };

export type FixoEditado = {
  descricao: string;
  valorCentavos: number;
  /** Valor do fixo antes da edição: só lançamentos que ainda têm esse valor recebem o novo. */
  valorAntigo: number;
  /** Novo dia do mês, só quando mudou (senão a data do lançamento é mantida). */
  novoDiaDoMes: number | null;
  formaPagamento: "PIX" | "DEBITO" | "DINHEIRO" | "CREDITO" | "VR";
  categoriaId: string | null;
  carteiraId: string | null;
  cartao: { id: string; diaFechamento: number; diaVencimento: number } | null;
};

/**
 * Campos de um lançamento futuro (data >= `aPartirDe`) depois de editar o fixo.
 * - Valor só muda se o lançamento ainda tem o valor antigo (preserva edição manual).
 * - Data: com novo dia, vai para o dia no mês da recorrência; se esse dia já passou (antes de
 *   `aPartirDe`), a data atual é mantida — nunca move um lançamento para o passado.
 * - Competência: fora do crédito é o mês da recorrência; no crédito, o ciclo do cartão.
 */
export function camposDoLancamentoFuturo(lancamento: LancamentoFuturo, fixo: FixoEditado, aPartirDe: Date) {
  const mes = lancamento.mesRecorrencia;
  const novaData = mes && fixo.novoDiaDoMes ? dataNaCompetencia(mes, fixo.novoDiaDoMes) : null;
  const data = novaData && novaData >= aPartirDe ? novaData : lancamento.data;
  const competencia = fixo.cartao
    ? cicloDoCartao(data, fixo.cartao.diaFechamento, fixo.cartao.diaVencimento).competencia
    : mes ?? lancamento.competencia;
  return {
    descricao: fixo.descricao,
    valorCentavos: lancamento.valorCentavos === fixo.valorAntigo ? fixo.valorCentavos : lancamento.valorCentavos,
    data,
    competencia,
    formaPagamento: fixo.formaPagamento,
    categoriaId: fixo.categoriaId,
    carteiraId: fixo.carteiraId,
    cartaoId: fixo.cartao?.id ?? null,
  };
}
