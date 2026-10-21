import { z } from "zod";
import { LancamentoBaseSchema } from "./create.dto";

export const UpdateLancamentoSchema = LancamentoBaseSchema.partial().extend({
  aplicarEmParcelasFuturas: z.boolean({ invalid_type_error: "aplicarEmParcelasFuturas deve ser verdadeiro ou falso." }).optional(),
  revisado: z.boolean({ invalid_type_error: "Revisado deve ser verdadeiro ou falso." }).optional(),
});
export type UpdateLancamentoDto = z.infer<typeof UpdateLancamentoSchema>;
