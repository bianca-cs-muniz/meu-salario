import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CHAVES_FINANCEIRAS } from '@constants/chavesQuery';

/** Recarrega tudo que depende de lançamentos (substitui o antigo `avisarMudanca`). */
export const useInvalidarDados = () => {
  const queryClient = useQueryClient();

  return useCallback(
    () => Promise.all(CHAVES_FINANCEIRAS.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
    [queryClient],
  );
};
