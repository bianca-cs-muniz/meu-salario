import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAuth from '@contexts/AuthContext';
import { CHAVES } from '@constants/chavesQuery';
import { ROTA_INICIAL } from '@constants/rotas';
import autenticacaoService, { type IRegistrarDto } from '@services/autenticacao.service';

export const useRegistrarMutacao = () => {
  const { signInHandler } = useAuth();
  const queryClient = useQueryClient();
  const navegar = useNavigate();

  const { mutateAsync, isPending, error } = useMutation({
    mutationKey: ['registrar'],
    mutationFn: (dto: IRegistrarDto) => autenticacaoService.registrar(dto),
    onSuccess: ({ token, usuario }) => {
      signInHandler(token);
      queryClient.setQueryData(CHAVES.MEU_PERFIL, usuario);
      navegar(ROTA_INICIAL, { replace: true });
    },
  });

  return {
    registrar: (dto: IRegistrarDto) => mutateAsync(dto).catch(() => null),
    estaRegistrando: isPending,
    erroRegistro: error,
  };
};
