import { z } from "zod";

// Telefone: só dígitos com DDI (ex.: "5511999998888"). Aceita máscara e remove o que não é dígito.
// "" ou null desliga o WhatsApp.
const telefone = z.preprocess(
  (v) => (typeof v === "string" ? (v.replace(/\D/g, "") === "" ? null : v.replace(/\D/g, "")) : v),
  z.string().regex(/^\d{12,13}$/, "Telefone deve ter 12 ou 13 dígitos com DDI (ex.: 5511999998888).").nullable(),
);

export const PerfilSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome.").max(100, "Use até 100 caracteres.").optional(),
  telefoneWhatsapp: telefone.optional(),
});
export type PerfilDto = z.infer<typeof PerfilSchema>;
