import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuth from '@contexts/AuthContext';
import autenticacaoService, { type IAtualizarPerfilDto } from '@services/autenticacao.service';
import { CHAVES } from '@constants/chavesQuery';
import { ErroHttp } from '@utils/erroHttp';

export const useMeuPerfil = () => {
  const { signIn, signOutHandler } = useAuth();
  const queryClient = useQueryClient();

  const { data: usuario, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: CHAVES.MEU_PERFIL,
    queryFn: () => autenticacaoService.perfil(),
    enabled: signIn,
    // Como no legado, o perfil é checado só ao abrir o app (ou em "Tentar de novo").
    staleTime: Infinity,
    refetchOnReconnect: false,
  });

  // Só desloga se a API disse que o token não vale. Falha de rede mantém o login.
  const tokenInvalido = error instanceof ErroHttp && (error.status === 401 || error.status === 403);
  useEffect(() => {
    if (tokenInvalido) signOutHandler();
  }, [tokenInvalido, signOutHandler]);

  const { mutateAsync: atualizarPerfil, isPending: estaAtualizando } = useMutation({
    mutationFn: (dto: IAtualizarPerfilDto) => autenticacaoService.atualizarPerfil(dto),
    onSuccess: (atualizado) => queryClient.setQueryData(CHAVES.MEU_PERFIL, atualizado),
  });

  return {
    usuario: usuario ?? null,
    // Ao tentar de novo depois de um erro, volta a mostrar a tela em branco (como antes).
    estaCarregando: isLoading || (!usuario && !!error && isFetching),
    /** Tem token, mas o perfil falhou por outro motivo que não 401/403 (rede, 5xx…). Não é motivo para deslogar. */
    semConexao: !!error && !tokenInvalido,
    tentarDeNovo: () => { refetch(); },
    atualizarPerfil,
    estaAtualizando,
  };
};
