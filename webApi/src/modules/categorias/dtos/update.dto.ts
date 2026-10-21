import { z } from "zod";
import { CategoriaBaseSchema } from "./create.dto";

export const UpdateCategoriaSchema = CategoriaBaseSchema.partial();
export type UpdateCategoriaDto = z.infer<typeof UpdateCategoriaSchema>;
