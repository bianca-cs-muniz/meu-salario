import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CHAVES } from '@constants/chavesQuery';
import type { ISalvarRecorrencia, TipoCarteira } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import cartoesService, { type ISalvarCartao } from '@features/cartoes/services';
import carteirasService from '@features/configuracoes/services';
import painelService from '../services';

/** Resumo do mês selecionado. Mantém o mês anterior na tela enquanto o novo carrega. */
export const useResumo = (competencia: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...CHAVES.RESUMO, competencia],
    queryFn: () => painelService.buscarResumo(competencia),
    placeholderData: keepPreviousData,
  });

  return {
    resumo: data,
    estaCarregando: isLoading,
    erro: error ? mensagemDeErro(error, 'Não foi possível carregar.') : null,
    recarregar: () => { refetch(); },
  };
};

/** Evolução dos últimos meses (gráfico do painel). */
export const useEvolucao = (meses = 6) => {
  const { data, isLoading } = useQuery({
    queryKey: [...CHAVES.EVOLUCAO, meses],
    queryFn: () => painelService.buscarEvolucao(meses),
  });

  return { evolucao: data, estaCarregando: isLoading };
};

/**
 * Cadastros do Onboarding. Não invalida o resumo a cada passo (senão o painel
 * trocaria o Onboarding pela tela principal no meio do fluxo): isso só acontece no "Terminar".
 */
export const useOnboardingMutacoes = () => {
  const queryClient = useQueryClient();

  const criarEntradaFixa = useMutation({
    mutationFn: (dto: ISalvarRecorrencia) => painelService.criarGastoFixo(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVES.FIXOS }),
  });

  const criarCarteira = useMutation({
    mutationFn: (dto: { nome: string; tipo: TipoCarteira }) => carteirasService.criar(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVES.CARTEIRAS }),
  });

  const criarCartao = useMutation({
    mutationFn: (dto: ISalvarCartao) => cartoesService.criar(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVES.CARTOES }),
  });

  return {
    criarEntradaFixa: criarEntradaFixa.mutateAsync,
    criarCarteira: criarCarteira.mutateAsync,
    criarCartao: criarCartao.mutateAsync,
  };
};
