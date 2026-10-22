import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CHAVES } from '@constants/chavesQuery';
import { useInvalidarDados } from '@hooks/useInvalidarDados';
import type { IVinculoTelegram, TipoCarteira } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import { snackBar } from '@utils/SnackBar';
import carteirasService from '../services';
import telegramService from '../services/telegram.service';

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

// ---------- Telegram

/**
 * Status da conexão com o bot. Com `vinculo` (link gerado e ainda não usado), consulta a cada 3s
 * até conectar ou o link expirar.
 */
export const useStatusTelegram = (vinculo: IVinculoTelegram | null = null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: CHAVES.TELEGRAM,
    queryFn: () => telegramService.statusTelegram(),
    refetchInterval: (query) => {
      if (!vinculo || query.state.data?.conectado) return false;
      return Date.now() < new Date(vinculo.expiraEm).getTime() ? 3000 : false;
    },
  });

  return {
    status: data,
    estaCarregando: isLoading,
    erro: error ? mensagemDeErro(error, 'Não foi possível carregar.') : null,
    recarregar: () => { refetch(); },
  };
};

export const useTelegramMutacoes = () => {
  const queryClient = useQueryClient();
  const invalidarStatus = () => queryClient.invalidateQueries({ queryKey: CHAVES.TELEGRAM });

  const conectar = useMutation({
    mutationFn: () => telegramService.conectarTelegram(),
    onError: (error: Error) => snackBar(mensagemDeErro(error, 'Não foi possível gerar o link.'), 'error'),
  });

  const desconectar = useMutation({
    mutationFn: () => telegramService.desconectarTelegram(),
    onSuccess: () => {
      snackBar('Telegram desconectado', 'success');
      invalidarStatus();
    },
    onError: (error: Error) => snackBar(mensagemDeErro(error, 'Não foi possível desconectar.'), 'error'),
  });

  return {
    /** Resolve o link gerado, ou `null` se deu erro (o erro já vira snackBar). */
    conectar: () => conectar.mutateAsync().catch(() => null),
    estaConectando: conectar.isPending,
    desconectar: () => desconectar.mutateAsync().then(() => true).catch(() => false),
    estaDesconectando: desconectar.isPending,
  };
};
