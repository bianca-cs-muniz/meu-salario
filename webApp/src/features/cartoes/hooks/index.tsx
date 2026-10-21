import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ICartao } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import type { ISalvarCartao } from '../services';
import { useCartoesMutacoes } from './queryes';

/** Cores que a pessoa pode escolher para o cartão (gravadas em hex no banco). */
const CORES_CARTAO = ['#795064', '#C97896', '#5C3A4B', '#8A05BE', '#EC7000', '#CC092F', '#3B2531', '#6F6A9E'];

const diaValido = (dia: string) => {
  const n = Number(dia);
  return n >= 1 && n <= 28;
};

const CartaoSchema = z
  .object({
    nome: z.string(),
    diaFechamento: z.string(),
    diaVencimento: z.string(),
    limiteCentavos: z.number().nullable(),
    cor: z.string(),
  })
  .superRefine((d, ctx) => {
    if (!d.nome.trim()) {
      ctx.addIssue({ code: 'custom', path: ['nome'], message: 'Dê um nome ao cartão, por exemplo Nubank.' });
    }
    if (!diaValido(d.diaFechamento) || !diaValido(d.diaVencimento)) {
      ctx.addIssue({
        code: 'custom',
        path: ['diaFechamento'],
        message: 'Os dias de fechamento e vencimento precisam ser entre 1 e 28.',
      });
    }
  });

export type CartaoForm = z.infer<typeof CartaoSchema>;

interface IUseFormularioCartao {
  cartao?: ICartao;
  aoFechar: () => void;
}

/** Formulário de cadastro/edição de cartão (antigo FormCartao). */
export const useFormularioCartao = ({ cartao, aoFechar }: IUseFormularioCartao) => {
  const editando = !!cartao;
  const { criar, estaCriando, editar, estaEditando, excluir, estaExcluindo } = useCartoesMutacoes();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<CartaoForm>({
    resolver: zodResolver(CartaoSchema),
    reValidateMode: 'onSubmit',
    defaultValues: {
      nome: cartao?.nome ?? '',
      diaFechamento: String(cartao?.diaFechamento ?? ''),
      diaVencimento: String(cartao?.diaVencimento ?? ''),
      limiteCentavos: cartao?.limiteCentavos ?? null,
      cor: cartao?.cor ?? CORES_CARTAO[0],
    },
  });

  const handleSalvar = handleSubmit(async (d) => {
    setErroServidor(null);
    const corpo: ISalvarCartao = {
      nome: d.nome.trim(),
      diaFechamento: Number(d.diaFechamento),
      diaVencimento: Number(d.diaVencimento),
      limiteCentavos: d.limiteCentavos || null,
      cor: d.cor,
    };
    try {
      if (cartao) await editar({ id: cartao.id, dto: corpo });
      else await criar(corpo);
      aoFechar();
    } catch (e) {
      setErroServidor(mensagemDeErro(e, 'Não foi possível salvar.'));
    }
  });

  const handleRemover = async () => {
    if (!cartao) return;
    try {
      await excluir(cartao.id);
      aoFechar();
    } catch (e) {
      setErroServidor(mensagemDeErro(e, 'Não foi possível remover.'));
    }
  };

  // Uma mensagem por vez, na ordem da validação antiga.
  const erro = errors.nome?.message ?? errors.diaFechamento?.message ?? erroServidor;

  return {
    editando,
    cores: CORES_CARTAO,
    erro,
    salvando: estaCriando || estaEditando || isSubmitting,
    removendo: estaExcluindo,
    register,
    control,
    handleSalvar,
    handleRemover,
  };
};
