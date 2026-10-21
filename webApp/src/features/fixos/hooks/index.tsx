import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useConfirm } from 'material-ui-confirm';
import { useCategoriasLista } from '@features/categorias/hooks/queryes';
import { useCartoesLista } from '@features/cartoes/hooks/queryes';
import { useCarteirasLista } from '@features/configuracoes/hooks/queryes';
import type { FormaPagamento, IRecorrencia, ISalvarRecorrencia, TipoLancamento } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import { snackBar } from '@utils/SnackBar';
import { useFixosMutacoes } from './queryes';

const FixoSchema = z
  .object({
    tipo: z.enum(['ENTRADA', 'SAIDA']),
    descricao: z.string(),
    valorCentavos: z.number().nullable(),
    dia: z.string(),
    formaPagamento: z.enum(['PIX', 'DEBITO', 'DINHEIRO', 'CREDITO', 'VR']),
    categoriaId: z.string(),
    cartaoId: z.string(),
    carteiraId: z.string(),
  })
  .superRefine((d, ctx) => {
    if (!d.descricao.trim()) {
      ctx.addIssue({ code: 'custom', path: ['descricao'], message: 'Escreva uma descrição, por exemplo “Aluguel”.' });
    }
    if (!d.valorCentavos || d.valorCentavos <= 0) {
      ctx.addIssue({ code: 'custom', path: ['valorCentavos'], message: 'Digite um valor maior que zero.' });
    }
    const dia = Number(d.dia);
    if (!(dia >= 1 && dia <= 28)) {
      ctx.addIssue({ code: 'custom', path: ['dia'], message: 'O dia precisa ser entre 1 e 28.' });
    }
    if (d.tipo === 'SAIDA' && !d.categoriaId) {
      ctx.addIssue({ code: 'custom', path: ['categoriaId'], message: 'Escolha uma categoria.' });
    }
  });

export type FixoForm = z.infer<typeof FixoSchema>;

interface IUseFormularioFixo {
  recorrencia?: IRecorrencia;
  tipoInicial: TipoLancamento;
  aoFechar: () => void;
}

/** Formulário de gasto/entrada fixa (antigo FormFixo). */
export const useFormularioFixo = ({ recorrencia, tipoInicial, aoFechar }: IUseFormularioFixo) => {
  const { criar, estaCriando, editar, estaEditando, encerrar, estaEncerrando } = useFixosMutacoes();
  const confirmar = useConfirm();

  // ---------- opções
  const categorias = useCategoriasLista();
  const cartoes = useCartoesLista();
  const carteiras = useCarteirasLista();
  const erroOpcoes = categorias.erro ?? cartoes.erro ?? carteiras.erro;
  const opcoes = useMemo(() => {
    if (!categorias.lista || !cartoes.lista || !carteiras.lista) return null;
    return { categorias: categorias.lista, cartoes: cartoes.lista, carteiras: carteiras.lista };
  }, [categorias.lista, cartoes.lista, carteiras.lista]);

  // ---------- formulário
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FixoForm>({
    resolver: zodResolver(FixoSchema),
    reValidateMode: 'onSubmit',
    defaultValues: {
      tipo: tipoInicial,
      descricao: recorrencia?.descricao ?? '',
      valorCentavos: recorrencia?.valorCentavos ?? null,
      dia: String(recorrencia?.diaDoMes ?? ''),
      formaPagamento: recorrencia?.formaPagamento ?? 'PIX',
      categoriaId: recorrencia?.categoriaId ?? '',
      cartaoId: recorrencia?.cartaoId ?? '',
      carteiraId: recorrencia?.carteiraId ?? '',
    },
  });

  const [tipo, forma, cartaoId, carteiraId] = useWatch({
    control,
    name: ['tipo', 'formaPagamento', 'cartaoId', 'carteiraId'],
  });

  // Padrões derivados: primeiro cartão e a conta principal.
  const listaCartoes = opcoes?.cartoes ?? [];
  const listaCarteiras = opcoes?.carteiras ?? [];
  const contaPrincipal = listaCarteiras.find((c) => c.tipo === 'CONTA');
  const cartaoEfetivo = cartaoId || listaCartoes[0]?.id || '';
  const carteiraEfetiva = carteiraId || contaPrincipal?.id || '';

  const formas: FormaPagamento[] = ['PIX', 'DEBITO', ...(listaCartoes.length ? (['CREDITO'] as const) : []), 'DINHEIRO'];
  const categoriasAtivas = (opcoes?.categorias ?? []).filter((c) => c.ativa);

  // ---------- salvar / encerrar
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const handleSalvar = handleSubmit(async (d) => {
    const carteira = listaCarteiras.find((c) => c.id === carteiraEfetiva);
    const corpo: ISalvarRecorrencia = {
      tipo: d.tipo,
      descricao: d.descricao.trim(),
      valorCentavos: d.valorCentavos!,
      diaDoMes: Number(d.dia),
      formaPagamento: d.tipo === 'ENTRADA' ? (carteira?.tipo === 'VR' ? 'VR' : 'PIX') : d.formaPagamento,
      categoriaId: d.tipo === 'SAIDA' ? d.categoriaId : undefined,
      cartaoId: d.tipo === 'SAIDA' && d.formaPagamento === 'CREDITO' ? cartaoEfetivo : undefined,
      carteiraId: d.tipo === 'ENTRADA' ? carteiraEfetiva : d.formaPagamento === 'CREDITO' ? undefined : contaPrincipal?.id,
    };

    setErroServidor(null);
    try {
      if (recorrencia) await editar({ id: recorrencia.id, dto: corpo });
      else await criar(corpo);
      snackBar(recorrencia ? 'Fixo atualizado' : 'Fixo adicionado', 'success');
      aoFechar();
    } catch (e) {
      setErroServidor(mensagemDeErro(e, 'Não foi possível salvar.'));
    }
  });

  const handleEncerrar = async () => {
    if (!recorrencia) return;
    const { confirmed } = await confirmar({
      title: 'Encerrar fixo',
      description: `“${recorrencia.descricao}” deixa de entrar nos próximos meses. Os meses passados continuam como estão.`,
      confirmationText: 'Encerrar',
      cancellationText: 'Cancelar',
    });
    if (!confirmed) return;
    try {
      await encerrar(recorrencia.id);
      snackBar('Fixo encerrado', 'success');
      aoFechar();
    } catch (e) {
      setErroServidor(mensagemDeErro(e, 'Não foi possível encerrar.'));
    }
  };

  // Uma mensagem por vez, na ordem da validação antiga.
  const erro =
    errors.descricao?.message ??
    errors.valorCentavos?.message ??
    errors.dia?.message ??
    errors.categoriaId?.message ??
    erroServidor ??
    erroOpcoes;

  return {
    editando: !!recorrencia,
    carregandoOpcoes: !opcoes && !erroOpcoes,
    tipo,
    forma,
    formas,
    cartoes: listaCartoes,
    carteiras: listaCarteiras,
    categoriasAtivas,
    cartaoEfetivo,
    carteiraEfetiva,
    erro,
    salvando: estaCriando || estaEditando || isSubmitting,
    estaEncerrando,
    register,
    control,
    handleSalvar,
    handleEncerrar,
  };
};
