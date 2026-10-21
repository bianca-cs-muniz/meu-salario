import { z } from "zod";

const dia = (campo: string) =>
  z
    .number({ required_error: `Informe o dia de ${campo}.`, invalid_type_error: `Dia de ${campo} deve ser um número.` })
    .int(`Dia de ${campo} deve ser inteiro.`)
    .min(1, `Dia de ${campo} deve ficar entre 1 e 28.`)
    .max(28, `Dia de ${campo} deve ficar entre 1 e 28.`);

export const CartaoBaseSchema = z.object({
  nome: z.string({ required_error: "Informe o nome." }).trim().min(1, "Informe o nome.").max(60, "Use até 60 caracteres."),
  diaFechamento: dia("fechamento"),
  diaVencimento: dia("vencimento"),
  limiteCentavos: z.number().int("Limite deve ser em centavos inteiros.").min(0, "Limite não pode ser negativo.").max(2_147_483_647).nullable(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve estar no formato #RRGGBB."),
});

export const CreateCartaoSchema = CartaoBaseSchema.extend({
  limiteCentavos: CartaoBaseSchema.shape.limiteCentavos.default(null),
  cor: CartaoBaseSchema.shape.cor.default("#7A6BC4"),
});
export type CreateCartaoDto = z.infer<typeof CreateCartaoSchema>;
