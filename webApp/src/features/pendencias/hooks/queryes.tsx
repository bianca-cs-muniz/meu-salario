import { keepPreviousData, useIsMutating, useMutation, useQuery } from '@tanstack/react-query';
import { CHAVES } from '@constants/chavesQuery';
import { useInvalidarDados } from '@hooks/useInvalidarDados';
import type { ILancamento } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import { snackBar } from '@utils/SnackBar';
import lancamentosService from '@features/lancamentos/services';

const FILTRO = { revisado: false };
const CHAVE_APROVAR = ['pendencias', 'aprovar'];

/** O que o estagiário anotou pelo WhatsApp e ainda não foi revisado. */
export const usePendenciasLista = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...CHAVES.LANCAMENTOS, FILTRO],
    queryFn: () => lancamentosService.listar(FILTRO),
    placeholderData: keepPreviousData,
  });

  return {
    lista: data,
    estaCarregando: isLoading,
    erro: error ? mensagemDeErro(error, 'Não foi possível carregar.') : null,
    recarregar: () => { refetch(); },
  };
};

export const usePendenciasMutacoes = () => {
  const invalidarDados = useInvalidarDados();

  const aprovar = useMutation({
    mutationKey: CHAVE_APROVAR,
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => lancamentosService.revisar(id))),
    onSuccess: (_, ids) => {
      snackBar(ids.length > 1 ? `${ids.length} lançamentos aprovados` : 'Lançamento aprovado', 'success');
      invalidarDados();
    },
    onError: (error: Error) => snackBar(error.message || 'Não foi possível aprovar.', 'error'),
  });

  const excluir = useMutation({
    mutationFn: (l: ILancamento) => lancamentosService.excluir(l.id, !!l.grupoParcelaId),
    onSuccess: () => {
      snackBar('Lançamento excluído', 'success');
      invalidarDados();
    },
    onError: (error: Error) => snackBar(error.message || 'Não foi possível excluir.', 'error'),
  });

  const aprovandoAlgum = useIsMutating({ mutationKey: CHAVE_APROVAR });

  return {
    aprovar: (ids: string[]) => aprovar.mutateAsync(ids).catch(() => null),
    // Compartilhado entre "Aprovar todos" e o "Aprovar" de cada card (como o antigo `ocupado`).
    estaAprovando: aprovandoAlgum > 0,
    excluir: (l: ILancamento) => excluir.mutateAsync(l).catch(() => null),
    estaExcluindo: excluir.isPending,
  };
};
