import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { CHAVES } from '@constants/chavesQuery';
import { useInvalidarDados } from '@hooks/useInvalidarDados';
import type { TipoCarteira } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import { snackBar } from '@utils/SnackBar';
import carteirasService from '../services';

export const useCarteirasLista = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: CHAVES.CARTEIRAS,
    queryFn: () => carteirasService.listar(),
    placeholderData: keepPreviousData,
  });

  return {
    lista: data,
    estaCarregando: isLoading,
    erro: error ? mensagemDeErro(error, 'Não foi possível carregar.') : null,
    recarregar: () => { refetch(); },
  };
};

export const useCarteirasMutacoes = () => {
  const invalidarDados = useInvalidarDados();

  const renomear = useMutation({
    mutationFn: ({ id, nome }: { id: string; nome: string }) => carteirasService.editar(id, { nome }),
    onSuccess: () => {
      snackBar('Carteira renomeada', 'success');
      invalidarDados();
    },
    onError: (error: Error) => snackBar(mensagemDeErro(error, 'Não foi possível renomear.'), 'error'),
  });

  const criar = useMutation({
    mutationFn: (dto: { nome: string; tipo: TipoCarteira }) => carteirasService.criar(dto),
    onSuccess: () => {
      snackBar('Carteira de VR criada. Cadastre o crédito mensal em Gastos fixos.', 'success');
      invalidarDados();
    },
    onError: (error: Error) => snackBar(mensagemDeErro(error, 'Não foi possível criar.'), 'error'),
  });

  return {
    /** Resolve `true` se deu certo (o erro já vira snackBar). */
    renomear: (id: string, nome: string) => renomear.mutateAsync({ id, nome }).then(() => true).catch(() => false),
    estaRenomeando: renomear.isPending,
    criarVr: () => criar.mutateAsync({ nome: 'VR', tipo: 'VR' }).catch(() => null),
    estaCriando: criar.isPending,
  };
};
