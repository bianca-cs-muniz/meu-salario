import { z } from "zod";
import { RequestQuery } from "@dtos/request-query.dto";
import { REGEX_COMPETENCIA } from "@helpers/competencia.helper";
import { formaPagamento, tipoLancamento } from "./create.dto";

const booleanoTexto = (campo: string) =>
  z
    .enum(["true", "false"], { errorMap: () => ({ message: `${campo} deve ser true ou false.` }) })
    .transform((v) => v === "true")
    .optional();

export const ReadLancamentoSchema = RequestQuery.extend({
  competencia: z.string().regex(REGEX_COMPETENCIA, "Competência deve estar no formato AAAA-MM.").optional(),
  categoriaId: z.string().min(1).optional(),
  cartaoId: z.string().min(1).optional(),
  carteiraId: z.string().min(1).optional(),
  formaPagamento: formaPagamento.optional(),
  tipo: tipoLancamento.optional(),
  origem: z
    .enum(["APP", "WHATSAPP", "RECORRENCIA", "TELEGRAM"], { errorMap: () => ({ message: "Origem deve ser APP, WHATSAPP, RECORRENCIA ou TELEGRAM." }) })
    .optional(),
  revisado: booleanoTexto("revisado"),
  busca: z.string().trim().optional(),
});
export type ReadLancamentoDto = z.infer<typeof ReadLancamentoSchema>;

export const DeleteLancamentoSchema = RequestQuery.extend({
  parcelasFuturas: booleanoTexto("parcelasFuturas"),
});
export type DeleteLancamentoDto = z.infer<typeof DeleteLancamentoSchema>;
