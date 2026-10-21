import { z } from "zod";

export const CategoriaBaseSchema = z.object({
  nome: z.string({ required_error: "Informe o nome." }).trim().min(1, "Informe o nome.").max(60, "Use até 60 caracteres."),
  icone: z.string({ required_error: "Escolha um ícone." }).trim().min(1, "Escolha um ícone.").max(60),
  cor: z.string({ required_error: "Escolha uma cor." }).regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve estar no formato #RRGGBB."),
  grupo: z.enum(["ESSENCIAL", "DESEJO", "POUPANCA"], { errorMap: () => ({ message: "Grupo deve ser ESSENCIAL, DESEJO ou POUPANCA." }) }),
  limiteMensalCentavos: z.number().int("Limite deve ser em centavos inteiros.").min(0, "Limite não pode ser negativo.").max(2_147_483_647).nullable(),
  aceitaVr: z.boolean({ invalid_type_error: "aceitaVr deve ser verdadeiro ou falso." }),
  ativa: z.boolean({ invalid_type_error: "Ativa deve ser verdadeiro ou falso." }),
});

export const CreateCategoriaSchema = CategoriaBaseSchema.extend({
  limiteMensalCentavos: CategoriaBaseSchema.shape.limiteMensalCentavos.default(null),
  aceitaVr: CategoriaBaseSchema.shape.aceitaVr.default(false),
  ativa: CategoriaBaseSchema.shape.ativa.default(true),
});
export type CreateCategoriaDto = z.infer<typeof CreateCategoriaSchema>;
