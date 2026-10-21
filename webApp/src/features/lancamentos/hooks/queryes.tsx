import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { CHAVES } from '@constants/chavesQuery';
import { useInvalidarDados } from '@hooks/useInvalidarDados';
import type { ICriarLancamento, IEditarLancamento, IFiltroLancamentos } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import lancamentosService from '../services';

export const useLancamentosLista = (filtro: IFiltroLancamentos = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...CHAVES.LANCAMENTOS, filtro],
    queryFn: () => lancamentosService.listar(filtro),
    placeholderData: keepPreviousData,
  });

  return {
    lista: data,
    estaCarregando: isLoading,
    erro: error ? mensagemDeErro(error, 'Não foi possível carregar.') : null,
    recarregar: () => { refetch(); },
  };
};

/** Mutations de lançamento. Os toasts ficam com quem chama (cada tela tem o seu texto). */
export const useLancamentosMutacoes = () => {
  const invalidarDados = useInvalidarDados();

  const criar = useMutation({
    mutationFn: (dto: ICriarLancamento) => lancamentosService.criar(dto),
    onSuccess: () => invalidarDados(),
  });

  const editar = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IEditarLancamento }) => lancamentosService.editar(id, dto),
    onSuccess: () => invalidarDados(),
  });

  const excluir = useMutation({
    mutationFn: ({ id, parcelasFuturas }: { id: string; parcelasFuturas: boolean }) =>
      lancamentosService.excluir(id, parcelasFuturas),
    onSuccess: () => invalidarDados(),
  });

  const revisar = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => lancamentosService.revisar(id))),
    onSuccess: () => invalidarDados(),
  });

  return {
    criar: criar.mutateAsync,
    estaCriando: criar.isPending,
    editar: editar.mutateAsync,
    estaEditando: editar.isPending,
    excluir: excluir.mutateAsync,
    estaExcluindo: excluir.isPending,
    revisar: revisar.mutateAsync,
    estaRevisando: revisar.isPending,
  };
};
