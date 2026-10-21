import { z } from "zod";
export const RegistrarSchema=z.object({nome:z.string().trim().min(1).max(100),email:z.string().trim().email().transform(v=>v.toLowerCase()),senha:z.string().min(8).max(100)});
export type RegistrarDto=z.infer<typeof RegistrarSchema>;
