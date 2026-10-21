import { Box, styled } from '@mui/material';

export const Conteudo = styled(Box)`
  .saldo {
    font-size: 2.6rem;
    line-height: 1;
  }

  .movimento {
    display: flex;
    gap: 24px;
    margin-top: 12px;
    font-size: 0.875rem;
  }

  .rotulo {
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .entrou {
    color: ${({ theme }) => theme.vars.palette.cores.credito};
  }

  .saiu {
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }
`;
