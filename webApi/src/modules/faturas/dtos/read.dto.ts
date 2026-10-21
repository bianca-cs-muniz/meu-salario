import { z } from "zod";
import { RequestQuery } from "@dtos/request-query.dto";
import { REGEX_COMPETENCIA } from "@helpers/competencia.helper";

export const ReadFaturaSchema = RequestQuery.extend({
  cartaoId: z.string({ required_error: "Informe o cartão." }).min(1, "Informe o cartão."),
  competencia: z.string({ required_error: "Informe a competência." }).regex(REGEX_COMPETENCIA, "Competência deve estar no formato AAAA-MM."),
});
export type ReadFaturaDto = z.infer<typeof ReadFaturaSchema>;
