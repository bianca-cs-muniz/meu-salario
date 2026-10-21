import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { CHAVES } from '@constants/chavesQuery';
import { useInvalidarDados } from '@hooks/useInvalidarDados';
import { mensagemDeErro } from '@utils/erroHttp';
import categoriasService, { type ISalvarCategoria } from '../services';

export const useCategoriasLista = (competencia?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...CHAVES.CATEGORIAS, competencia ?? null],
    queryFn: () => categoriasService.listar(competencia),
    placeholderData: keepPreviousData,
  });

  return {
    lista: data,
    estaCarregando: isLoading,
    erro: error ? mensagemDeErro(error, 'Não foi possível carregar.') : null,
    recarregar: () => { refetch(); },
  };
};

/** Mutations de categoria. Os toasts e erros ficam com o formulário (como no legado). */
export const useCategoriasMutacoes = () => {
  const invalidarDados = useInvalidarDados();

  const criar = useMutation({
    mutationFn: (dto: ISalvarCategoria) => categoriasService.criar(dto),
    onSuccess: () => invalidarDados(),
  });

  const editar = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<ISalvarCategoria> }) => categoriasService.editar(id, dto),
    onSuccess: () => invalidarDados(),
  });

  return {
    criar: criar.mutateAsync,
    estaCriando: criar.isPending,
    editar: editar.mutateAsync,
    estaEditando: editar.isPending,
  };
};
