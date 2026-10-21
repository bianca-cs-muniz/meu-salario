import { z } from "zod";
import { RequestQuery } from "@dtos/request-query.dto";
import { tipoLancamento } from "@modulos/lancamentos/dtos/create.dto";

export const ReadGastoFixoSchema = RequestQuery.extend({
  tipo: tipoLancamento.optional(),
});
export type ReadGastoFixoDto = z.infer<typeof ReadGastoFixoSchema>;
