export type StatusFatura = "ABERTA" | "FECHADA" | "PAGA" | "ATRASADA";

const UM_DIA_MS = 86_400_000;

/**
 * PAGA se tem pagaEm; ABERTA antes do fechamento; ATRASADA 24h depois do vencimento (só se há
 * algo a pagar: total > 0); senão FECHADA.
 */
export function statusFatura(pagaEm: Date | null, fechamento: Date, vencimento: Date, totalCentavos: number, agora = new Date()): StatusFatura {
  if (pagaEm) return "PAGA";
  if (agora.getTime() < fechamento.getTime()) return "ABERTA";
  if (totalCentavos > 0 && agora.getTime() > vencimento.getTime() + UM_DIA_MS) return "ATRASADA";
  return "FECHADA";
}
