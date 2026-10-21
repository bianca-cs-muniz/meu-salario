import { z } from "zod";
export const LoginSchema=z.object({email:z.string().trim().email().transform(v=>v.toLowerCase()),senha:z.string().min(1)});
export type LoginDto=z.infer<typeof LoginSchema>;
