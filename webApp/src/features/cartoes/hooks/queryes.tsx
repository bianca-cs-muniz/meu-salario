import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { CHAVES } from '@constants/chavesQuery';
import { useInvalidarDados } from '@hooks/useInvalidarDados';
import { mensagemDeErro } from '@utils/erroHttp';
import { snackBar } from '@utils/SnackBar';
import cartoesService, { type ISalvarCartao } from '../services';

export const useCartoesLista = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: CHAVES.CARTOES,
    queryFn: () => cartoesService.listar(),
    placeholderData: keepPreviousData,
  });

  return {
    lista: data,
    estaCarregando: isLoading,
    erro: error ? mensagemDeErro(error, 'Não foi possível carregar.') : null,
    recarregar: () => { refetch(); },
  };
};

/** Criar, editar e excluir cartão. Sucesso: toast + recarrega tudo; o erro fica com quem chama (aparece no formulário). */
export const useCartoesMutacoes = () => {
  const invalidarDados = useInvalidarDados();

  const criar = useMutation({
    mutationFn: (dto: ISalvarCartao) => cartoesService.criar(dto),
    onSuccess: () => {
      snackBar('Cartão cadastrado', 'success');
      invalidarDados();
    },
  });

  const editar = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<ISalvarCartao> & { ativo?: boolean } }) =>
      cartoesService.editar(id, dto),
    onSuccess: () => {
      snackBar('Cartão atualizado', 'success');
      invalidarDados();
    },
  });

  const excluir = useMutation({
    mutationFn: (id: string) => cartoesService.excluir(id),
    onSuccess: () => {
      snackBar('Cartão removido', 'success');
      invalidarDados();
    },
  });

  return {
    criar: criar.mutateAsync,
    estaCriando: criar.isPending,
    editar: editar.mutateAsync,
    estaEditando: editar.isPending,
    excluir: excluir.mutateAsync,
    estaExcluindo: excluir.isPending,
  };
};
