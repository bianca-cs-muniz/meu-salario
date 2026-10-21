import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAuth from '@contexts/AuthContext';
import { CHAVES } from '@constants/chavesQuery';
import { ROTA_INICIAL } from '@constants/rotas';
import autenticacaoService, { type ILoginDto } from '@services/autenticacao.service';

export const useLoginMutacao = () => {
  const { signInHandler } = useAuth();
  const queryClient = useQueryClient();
  const navegar = useNavigate();

  const { mutateAsync, isPending, error } = useMutation({
    mutationKey: ['login'],
    mutationFn: (dto: ILoginDto) => autenticacaoService.login(dto),
    onSuccess: ({ token, usuario }) => {
      signInHandler(token);
      queryClient.setQueryData(CHAVES.MEU_PERFIL, usuario);
      navegar(ROTA_INICIAL, { replace: true });
    },
  });

  return {
    logar: (dto: ILoginDto) => mutateAsync(dto).catch(() => null),
    estaLogando: isPending,
    erroLogin: error,
  };
};
