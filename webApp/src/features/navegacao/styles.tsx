import { Box, styled } from '@mui/material';

export const Corpo = styled(Box)`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.vars.palette.cores.papel};
`;

/** Área da página: largura máxima ≈ max-w-5xl, com espaço para a barra inferior no celular. */
export const Conteudo = styled(Box)`
  flex: 1;
  width: 100%;
  min-width: 0;
  max-width: 64rem;
  margin: 0 auto;
  padding: calc(1.5rem + env(safe-area-inset-top)) 16px 7rem;

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    padding: 32px 32px 40px;
  }
` as typeof Box;

/** Enquanto o perfil carrega: tela vazia na cor do papel. */
export const TelaEmBranco = styled(Box)`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.vars.palette.cores.papel};
`;
