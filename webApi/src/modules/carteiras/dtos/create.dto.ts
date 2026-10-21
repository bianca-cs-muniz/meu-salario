import { z } from "zod";

export const CreateCarteiraSchema = z.object({
  nome: z.string({ required_error: "Informe o nome." }).trim().min(1, "Informe o nome.").max(60, "Use até 60 caracteres."),
  tipo: z.enum(["CONTA", "VR"], { errorMap: () => ({ message: "Tipo deve ser CONTA ou VR." }) }),
});
export type CreateCarteiraDto = z.infer<typeof CreateCarteiraSchema>;
