import { z } from "zod";
import { CartaoBaseSchema } from "./create.dto";

export const UpdateCartaoSchema = CartaoBaseSchema.extend({
  ativo: z.boolean({ invalid_type_error: "Ativo deve ser verdadeiro ou falso." }),
}).partial();
export type UpdateCartaoDto = z.infer<typeof UpdateCartaoSchema>;
