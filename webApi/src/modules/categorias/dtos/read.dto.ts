import { z } from "zod";
import { RequestQuery } from "@dtos/request-query.dto";
import { REGEX_COMPETENCIA } from "@helpers/competencia.helper";

export const ReadCategoriaSchema = RequestQuery.extend({
  competencia: z.string().regex(REGEX_COMPETENCIA, "Competência deve estar no formato AAAA-MM.").optional(),
});
export type ReadCategoriaDto = z.infer<typeof ReadCategoriaSchema>;
