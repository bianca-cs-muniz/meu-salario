import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  width: 100%;
  max-width: 32rem;
  margin: 0 auto;
  padding-top: 16px;

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    padding-top: 48px;
  }

  .contador {
    margin-bottom: 12px;
    font-weight: 600;
  }

  .progresso {
    display: flex;
    gap: 6px;
    margin-bottom: 32px;
  }

  .progresso span {
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.vars.palette.cores.linha};
  }

  .progresso span.feito {
    background-color: ${({ theme }) => theme.vars.palette.cores.latao};
  }
`;
