import { Box, styled } from '@mui/material';

/** "Ainda não tem conta? Criar conta" */
export const Convite = styled(Box)`
  margin-top: 24px;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.vars.palette.cores.mudo};

  a {
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.vars.palette.cores.latao};
    text-underline-offset: 4px;
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }
` as typeof Box;
