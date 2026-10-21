import { z } from "zod";
import { RequestQuery } from "@dtos/request-query.dto";
import { REGEX_COMPETENCIA } from "@helpers/competencia.helper";

export const ReadResumoSchema = RequestQuery.extend({
  competencia: z.string().regex(REGEX_COMPETENCIA, "Competência deve estar no formato AAAA-MM.").optional(),
});
export type ReadResumoDto = z.infer<typeof ReadResumoSchema>;

export const ReadEvolucaoSchema = RequestQuery.extend({
  meses: z.coerce
    .number({ invalid_type_error: "Informe a quantidade de meses." })
    .int("Informe um número inteiro de meses.")
    .min(1, "Informe de 1 a 24 meses.")
    .max(24, "Informe de 1 a 24 meses.")
    .default(6),
});
export type ReadEvolucaoDto = z.infer<typeof ReadEvolucaoSchema>;
