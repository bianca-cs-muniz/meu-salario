import { z } from "zod";
import { CreateCarteiraSchema } from "./create.dto";

export const UpdateCarteiraSchema = CreateCarteiraSchema.pick({ nome: true })
  .extend({ ativa: z.boolean({ invalid_type_error: "Ativa deve ser verdadeiro ou falso." }) })
  .partial();
export type UpdateCarteiraDto = z.infer<typeof UpdateCarteiraSchema>;
