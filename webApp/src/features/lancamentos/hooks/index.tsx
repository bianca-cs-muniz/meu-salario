import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategoriasLista } from '@features/categorias/hooks/queryes';
import { useCartoesLista } from '@features/cartoes/hooks/queryes';
import { useCarteirasLista } from '@features/configuracoes/hooks/queryes';
import type { FormaPagamento, ILancamento, TipoLancamento } from '@services/tipos';
import { formatarDinheiro } from '@utils/dinheiro';
import { deInputData, nomeMesSemAno, paraInputData } from '@utils/datas';
import { mensagemDeErro } from '@utils/erroHttp';
import { snackBar } from '@utils/SnackBar';
import { useLancamentosMutacoes } from './queryes';

const FORMAS: FormaPagamento[] = ['PIX', 'DEBITO', 'CREDITO', 'VR', 'DINHEIRO'];

const LancamentoSchema = z
  .object({
    tipo: z.enum(['ENTRADA', 'SAIDA']),
    valorCentavos: z.number().nullable(),
    descricao: z.string(),
    categoriaId: z.string().nullable(),
    formaPagamento: z.enum(['PIX', 'DEBITO', 'DINHEIRO', 'CREDITO', 'VR']),
    cartaoId: z.string().nullable(),
    carteiraId: z.string().nullable(),
    parcelas: z.number(),
    data: z.string(),
  })
  .superRefine((d, ctx) => {
    if (!d.valorCentavos || d.valorCentavos <= 0) {
      ctx.addIssue({ code: 'custom', path: ['valorCentavos'], message: 'Digite um valor maior que zero, por exemplo 45,90.' });
    }
    if (!d.descricao.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['descricao'],
        message: d.tipo === 'SAIDA'
          ? 'Escreva uma descrição, por exemplo “mercado”.'
          : 'Escreva de onde veio, por exemplo “freela”.',
      });
    }
    if (d.tipo === 'SAIDA' && !d.categoriaId) {
      ctx.addIssue({ code: 'custom', path: ['categoriaId'], message: 'Escolha uma categoria.' });
    }
    if (d.tipo === 'SAIDA' && d.formaPagamento === 'CREDITO' && !d.cartaoId) {
      ctx.addIssue({ code: 'custom', path: ['cartaoId'], message: 'Escolha o cartão.' });
    }
  });

export type LancamentoForm = z.infer<typeof LancamentoSchema>;

interface IUseFormularioLancamento {
  lancamento?: ILancamento;
  tipoInicial?: TipoLancamento;
  aoFechar: () => void;
}

/** Formulário único de gasto/entrada (antigo FormLancamento). */
export const useFormularioLancamento = ({ lancamento, tipoInicial, aoFechar }: IUseFormularioLancamento) => {
  const editando = !!lancamento;
  const ehParcela = !!lancamento?.parcelaTotal;
  const ehRecorrencia = !!lancamento?.recorrenciaId;

  const { criar, estaCriando, editar, estaEditando, excluir } = useLancamentosMutacoes();

  // ---------- opções (categorias, cartões, carteiras ativos)
  const categorias = useCategoriasLista();
  const cartoes = useCartoesLista();
  const carteiras = useCarteirasLista();
  const erroOpcoes = categorias.erro ?? cartoes.erro ?? carteiras.erro;
  const opcoes = useMemo(() => {
    if (!categorias.lista || !cartoes.lista || !carteiras.lista) return null;
    return {
      categorias: categorias.lista.filter((c) => c.ativa),
      cartoes: cartoes.lista.filter((c) => c.ativo),
      carteiras: carteiras.lista.filter((c) => c.ativa),
    };
  }, [categorias.lista, cartoes.lista, carteiras.lista]);

  // ---------- formulário
  const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LancamentoForm>({
    resolver: zodResolver(LancamentoSchema),
    reValidateMode: 'onSubmit',
    defaultValues: {
      tipo: lancamento?.tipo ?? tipoInicial ?? 'SAIDA',
      valorCentavos: lancamento?.valorCentavos ?? null,
      descricao: lancamento?.descricao ?? '',
      categoriaId: lancamento?.categoriaId ?? null,
      formaPagamento: lancamento?.formaPagamento ?? 'PIX',
      cartaoId: lancamento?.cartaoId ?? null,
      carteiraId: lancamento?.carteiraId ?? null,
      parcelas: 1,
      data: paraInputData(lancamento?.data),
    },
  });

  const [tipo, valor, forma, categoriaId, cartaoId, data] = useWatch({
    control,
    name: ['tipo', 'valorCentavos', 'formaPagamento', 'categoriaId', 'cartaoId', 'data'],
  });

  // Novo lançamento: primeiro cartão ativo e a carteira CONTA, assim que as opções chegam.
  const padroesAplicados = useRef(false);
  useEffect(() => {
    if (!opcoes || lancamento || padroesAplicados.current) return;
    padroesAplicados.current = true;
    if (opcoes.cartoes.length) setValue('cartaoId', opcoes.cartoes[0].id);
    setValue('carteiraId', opcoes.carteiras.find((c) => c.tipo === 'CONTA')?.id ?? null);
  }, [opcoes, lancamento, setValue]);

  const carteiraVr = opcoes?.carteiras.find((c) => c.tipo === 'VR');
  const formasDisponiveis = FORMAS.filter((f) =>
    f === 'VR' ? !!carteiraVr : f === 'CREDITO' ? !!opcoes?.cartoes.length : true,
  );
  const categoriasVisiveis = (opcoes?.categorias ?? []).filter((c) => (forma === 'VR' ? c.aceitaVr : true));
  const cartaoEscolhido = opcoes?.cartoes.find((c) => c.id === cartaoId);

  /** Chamado depois de trocar a forma de pagamento (Controller de `formaPagamento`). */
  const ajustarCategoriaParaForma = (f: FormaPagamento) => {
    // VR só vale para algumas categorias: limpa se a escolhida não aceitar.
    const escolhida = opcoes?.categorias.find((c) => c.id === categoriaId);
    if (f === 'VR' && escolhida && !escolhida.aceitaVr) setValue('categoriaId', null);
  };

  // ---------- salvar / excluir
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [pergunta, setPergunta] = useState<'salvar' | 'excluir' | null>(null);

  const enviar = async (d: LancamentoForm, aplicarEmParcelasFuturas: boolean) => {
    setPergunta(null);
    setErroServidor(null);

    const formaFinal: FormaPagamento = d.tipo === 'ENTRADA' ? (d.carteiraId === carteiraVr?.id ? 'VR' : 'PIX') : d.formaPagamento;
    const corpo = {
      tipo: d.tipo,
      valorCentavos: d.valorCentavos!,
      descricao: d.descricao.trim(),
      data: deInputData(d.data),
      formaPagamento: formaFinal,
      categoriaId: d.tipo === 'SAIDA' ? d.categoriaId! : undefined,
      cartaoId: d.tipo === 'SAIDA' && d.formaPagamento === 'CREDITO' ? d.cartaoId! : undefined,
      carteiraId: d.tipo === 'ENTRADA' ? d.carteiraId ?? undefined : d.formaPagamento === 'VR' ? carteiraVr?.id : undefined,
    };

    try {
      if (editando) {
        await editar({
          id: lancamento!.id,
          dto: {
            ...corpo,
            aplicarEmParcelasFuturas,
            ...(lancamento!.revisado ? {} : { revisado: true }),
          },
        });
        snackBar('Alterações salvas', 'success');
      } else {
        const res = await criar({
          ...corpo,
          parcelas: d.formaPagamento === 'CREDITO' && d.tipo === 'SAIDA' ? d.parcelas : undefined,
        });
        const partes = [d.tipo === 'SAIDA' ? 'Gasto adicionado' : 'Entrada adicionada'];
        if (d.formaPagamento === 'VR' && res.impacto.saldoVrCentavos != null) {
          partes.push(`Saldo do VR: ${formatarDinheiro(res.impacto.saldoVrCentavos)}`);
        } else if (d.formaPagamento === 'CREDITO' && res.impacto.faturaTotalCentavos != null) {
          partes.push(`Fatura de ${nomeMesSemAno(res.impacto.faturaCompetencia!)}: ${formatarDinheiro(res.impacto.faturaTotalCentavos)}`);
        } else {
          partes.push(`Sobra do mês: ${formatarDinheiro(res.impacto.sobraCentavos)}`);
        }
        snackBar(partes.join('. '), res.impacto.saldoInsuficiente ? 'error' : 'success');
      }
      aoFechar();
    } catch (e) {
      setErroServidor(mensagemDeErro(e, 'Não foi possível salvar.'));
    }
  };

  const handleSalvar = handleSubmit((d) => {
    // Parcela: pergunta antes se a alteração vale só nesta ou nas próximas também.
    if (editando && ehParcela) return setPergunta('salvar');
    return enviar(d, false);
  });

  const salvarParcelas = (aplicarEmParcelasFuturas: boolean) =>
    handleSubmit((d) => enviar(d, aplicarEmParcelasFuturas))();

  const handleExcluir = async (parcelasFuturas: boolean) => {
    setPergunta(null);
    try {
      await excluir({ id: lancamento!.id, parcelasFuturas });
      snackBar(parcelasFuturas ? 'Parcelas excluídas' : 'Lançamento excluído', 'success');
      aoFechar();
    } catch (e) {
      setErroServidor(mensagemDeErro(e, 'Não foi possível excluir.'));
    }
  };

  // Uma mensagem por vez, na ordem da validação antiga.
  const erro =
    errors.valorCentavos?.message ??
    errors.descricao?.message ??
    errors.categoriaId?.message ??
    errors.cartaoId?.message ??
    erroServidor ??
    erroOpcoes;

  return {
    // estado
    editando,
    ehParcela,
    ehRecorrencia,
    carregandoOpcoes: !opcoes && !erroOpcoes,
    opcoes,
    tipo,
    valor,
    forma,
    categoriaId,
    data,
    dataEhHoje: data === paraInputData(),
    carteiraVr,
    formasDisponiveis,
    categoriasVisiveis,
    cartaoEscolhido,
    erro,
    // isSubmitting cobre o intervalo entre o clique e a mutação começar (evita lançamento duplicado).
    salvando: estaCriando || estaEditando || isSubmitting,
    pergunta,
    // formulário
    register,
    control,
    ajustarCategoriaParaForma,
    // ações
    handleSalvar,
    salvarParcelas,
    handleExcluir,
    perguntarExclusao: () => setPergunta('excluir'),
    fecharPergunta: () => setPergunta(null),
  };
};
