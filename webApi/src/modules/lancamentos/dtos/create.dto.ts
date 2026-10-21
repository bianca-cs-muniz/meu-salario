import { z } from "zod";
import { interpretarData } from "@helpers/competencia.helper";

/** Id opcional: "" ou null contam como "não informado". */
export const idOpcional = z.preprocess((v) => (v === "" || v === null ? undefined : v), z.string().min(1).optional());

export const tipoLancamento = z.enum(["ENTRADA", "SAIDA"], { errorMap: () => ({ message: "Tipo deve ser ENTRADA ou SAIDA." }) });

export const formaPagamento = z.enum(["PIX", "DEBITO", "DINHEIRO", "CREDITO", "VR"], {
  errorMap: () => ({ message: "Forma de pagamento deve ser PIX, DEBITO, DINHEIRO, CREDITO ou VR." }),
});

export const descricao = z.string({ required_error: "Informe a descrição." }).trim().min(1, "Informe a descrição.").max(120, "Use até 120 caracteres.");

export const valorCentavos = z
  .number({ required_error: "Informe o valor.", invalid_type_error: "O valor deve ser um número em centavos." })
  .int("O valor deve ser em centavos inteiros.")
  .positive("O valor deve ser maior que zero.")
  .max(2_147_483_647, "Valor alto demais.");

const REGEX_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;
const REGEX_ISO_COMPLETO = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d{1,3})?)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;

/** Dia existente no calendário (rejeita 2026-02-31, 2026-13-01...). */
function diaExiste(ano: number, mes: number, dia: number): boolean {
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

/** Aceita só "AAAA-MM-DD" (dia existente) ou ISO 8601 completo com Z ou offset. */
export function dataValida(texto: string): boolean {
  const partes = REGEX_DIA.exec(texto) ?? REGEX_ISO_COMPLETO.exec(texto);
  if (!partes || !diaExiste(Number(partes[1]), Number(partes[2]), Number(partes[3]))) return false;
  return !Number.isNaN(interpretarData(texto).getTime());
}

export const dataTexto = z
  .string({ invalid_type_error: "Data inválida." })
  .refine(dataValida, "Data inválida. Use AAAA-MM-DD ou data ISO completa (ex.: 2026-10-21T12:00:00-03:00).");

export const LancamentoBaseSchema = z.object({
  tipo: tipoLancamento,
  descricao,
  valorCentavos,
  data: dataTexto.optional(),
  formaPagamento,
  categoriaId: idOpcional,
  carteiraId: idOpcional,
  cartaoId: idOpcional,
});

export const CreateLancamentoSchema = LancamentoBaseSchema.extend({
  parcelas: z
    .number({ invalid_type_error: "Parcelas deve ser um número." })
    .int("Parcelas deve ser um número inteiro.")
    .min(1, "Parcelas deve ficar entre 1 e 48.")
    .max(48, "Parcelas deve ficar entre 1 e 48.")
    .default(1),
});
export type CreateLancamentoDto = z.infer<typeof CreateLancamentoSchema>;
