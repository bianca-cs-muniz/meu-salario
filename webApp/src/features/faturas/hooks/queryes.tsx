import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { CHAVES } from '@constants/chavesQuery';
import { useInvalidarDados } from '@hooks/useInvalidarDados';
import type { IFaturaResumo } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import { snackBar } from '@utils/SnackBar';
import faturasService from '../services';

/** Fatura de um cartão numa competência ("AAAA-MM"). */
export const useFatura = (cartaoId: string, competencia: string) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [...CHAVES.FATURAS, cartaoId, competencia],
    queryFn: () => faturasService.buscar(cartaoId, competencia),
    placeholderData: keepPreviousData,
    enabled: !!cartaoId,
  });

  return {
    fatura: data,
    estaCarregando: isLoading || isFetching,
    erro: error ? mensagemDeErro(error, 'Não foi possível carregar.') : null,
    recarregar: () => { refetch(); },
  };
};

/** Histórico de faturas de um cartão. */
export const useFaturasHistorico = (cartaoId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...CHAVES.FATURAS, 'cartao', cartaoId],
    queryFn: () => faturasService.historico(cartaoId),
    enabled: !!cartaoId,
  });

  return {
    lista: data,
    estaCarregando: isLoading,
    erro: error ? mensagemDeErro(error, 'Não foi possível carregar.') : null,
    recarregar: () => { refetch(); },
  };
};

export const useFaturasMutacoes = () => {
  const invalidarDados = useInvalidarDados();

  /** Paga a fatura, ou desfaz o pagamento se ela já estiver paga. */
  const alternarPagamento = useMutation({
    mutationFn: (fatura: IFaturaResumo) =>
      fatura.pagaEm ? faturasService.desfazerPagamento(fatura.id!) : faturasService.pagar(fatura.id!),
    onSuccess: (_, fatura) => {
      snackBar(fatura.pagaEm ? 'Pagamento desfeito' : 'Fatura marcada como paga', 'success');
      invalidarDados();
    },
    onError: (error: Error) => snackBar(mensagemDeErro(error, 'Não foi possível atualizar.'), 'error'),
  });

  return {
    // Fatura sem registro (id null) não pode ser paga.
    alternarPagamento: (fatura: IFaturaResumo) =>
      fatura.id ? alternarPagamento.mutateAsync(fatura).catch(() => null) : Promise.resolve(null),
    estaPagando: alternarPagamento.isPending,
  };
};
