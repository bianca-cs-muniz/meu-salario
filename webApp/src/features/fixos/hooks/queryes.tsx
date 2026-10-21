import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { CHAVES } from '@constants/chavesQuery';
import { useInvalidarDados } from '@hooks/useInvalidarDados';
import type { ISalvarRecorrencia } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import gastosFixosService from '../services';

export const useFixosLista = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: CHAVES.FIXOS,
    queryFn: () => gastosFixosService.listar(),
    placeholderData: keepPreviousData,
  });

  return {
    lista: data,
    estaCarregando: isLoading,
    erro: error ? mensagemDeErro(error, 'Não foi possível carregar.') : null,
    recarregar: () => { refetch(); },
  };
};

/** Mutations de gasto fixo. Os toasts e erros ficam com o formulário (como no legado). */
export const useFixosMutacoes = () => {
  const invalidarDados = useInvalidarDados();

  const criar = useMutation({
    mutationFn: (dto: ISalvarRecorrencia) => gastosFixosService.criar(dto),
    onSuccess: () => invalidarDados(),
  });

  const editar = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<ISalvarRecorrencia> }) => gastosFixosService.editar(id, dto),
    onSuccess: () => invalidarDados(),
  });

  const encerrar = useMutation({
    mutationFn: (id: string) => gastosFixosService.encerrar(id),
    onSuccess: () => invalidarDados(),
  });

  return {
    criar: criar.mutateAsync,
    estaCriando: criar.isPending,
    editar: editar.mutateAsync,
    estaEditando: editar.isPending,
    encerrar: encerrar.mutateAsync,
    estaEncerrando: encerrar.isPending,
  };
};
