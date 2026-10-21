import { z } from "zod";
import { CreateGastoFixoSchema } from "./create.dto";

export const UpdateGastoFixoSchema = CreateGastoFixoSchema.partial();
export type UpdateGastoFixoDto = z.infer<typeof UpdateGastoFixoSchema>;
