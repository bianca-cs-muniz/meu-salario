import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ICategoria } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import { snackBar } from '@utils/SnackBar';
import { CORES_CATEGORIA } from '../cores';
import type { ISalvarCategoria } from '../services';
import { useCategoriasMutacoes } from './queryes';

const CategoriaSchema = z.object({
  nome: z.string().refine((v) => v.trim().length > 0, 'Dê um nome à categoria.'),
  icone: z.string(),
  cor: z.string(),
  grupo: z.enum(['ESSENCIAL', 'DESEJO', 'POUPANCA']),
  limiteMensalCentavos: z.number().nullable(),
  aceitaVr: z.boolean(),
});

export type CategoriaForm = z.infer<typeof CategoriaSchema>;

interface IUseFormularioCategoria {
  categoria?: ICategoria;
  aoFechar: () => void;
}

/** Formulário de categoria (antigo FormCategoria). */
export const useFormularioCategoria = ({ categoria, aoFechar }: IUseFormularioCategoria) => {
  const { criar, estaCriando, editar, estaEditando } = useCategoriasMutacoes();

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoriaForm>({
    resolver: zodResolver(CategoriaSchema),
    reValidateMode: 'onSubmit',
    defaultValues: {
      nome: categoria?.nome ?? '',
      icone: categoria?.icone ?? 'package',
      cor: categoria?.cor ?? CORES_CATEGORIA[0],
      grupo: categoria?.grupo ?? 'DESEJO',
      limiteMensalCentavos: categoria?.limiteMensalCentavos ?? null,
      aceitaVr: categoria?.aceitaVr ?? false,
    },
  });

  const [icone, cor] = useWatch({ control, name: ['icone', 'cor'] });

  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [alternando, setAlternando] = useState(false);

  const salvar = async (dados: Partial<ISalvarCategoria>, completo: ISalvarCategoria | null, mensagem: string) => {
    setErroServidor(null);
    try {
      if (categoria) await editar({ id: categoria.id, dto: dados });
      else if (completo) await criar(completo);
      snackBar(mensagem, 'success');
      aoFechar();
    } catch (e) {
      setErroServidor(mensagemDeErro(e, 'Não foi possível salvar.'));
    }
  };

  const handleSalvar = handleSubmit((d) => {
    const dados: ISalvarCategoria = { ...d, nome: d.nome.trim(), limiteMensalCentavos: d.limiteMensalCentavos || null };
    return salvar(dados, dados, categoria ? 'Categoria atualizada' : 'Categoria criada');
  });

  /** Desativar / Reativar: só muda `ativa`, sem validar o resto do formulário. */
  const handleAlternarAtiva = async () => {
    if (!categoria) return;
    setAlternando(true);
    await salvar({ ativa: !categoria.ativa }, null, categoria.ativa ? 'Categoria desativada' : 'Categoria reativada');
    setAlternando(false);
  };

  return {
    editando: !!categoria,
    ativa: categoria?.ativa ?? true,
    icone,
    cor,
    erro: errors.nome?.message ?? erroServidor,
    salvando: estaCriando || estaEditando || isSubmitting || alternando,
    register,
    control,
    handleSalvar,
    handleAlternarAtiva,
  };
};
