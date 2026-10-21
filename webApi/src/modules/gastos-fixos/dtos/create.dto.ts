import { z } from "zod";
import { descricao, formaPagamento, idOpcional, tipoLancamento, valorCentavos } from "@modulos/lancamentos/dtos/create.dto";

export const CreateGastoFixoSchema = z.object({
  tipo: tipoLancamento,
  descricao,
  valorCentavos,
  diaDoMes: z
    .number({ required_error: "Informe o dia do mês.", invalid_type_error: "Dia do mês deve ser um número." })
    .int("Dia do mês deve ser inteiro.")
    .min(1, "Dia do mês deve ficar entre 1 e 28.")
    .max(28, "Dia do mês deve ficar entre 1 e 28."),
  formaPagamento,
  categoriaId: idOpcional,
  carteiraId: idOpcional,
  cartaoId: idOpcional,
});
export type CreateGastoFixoDto = z.infer<typeof CreateGastoFixoSchema>;
