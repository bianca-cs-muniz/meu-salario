import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: inline-flex;
  align-self: flex-start;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};

  .opcao {
    padding: 6px 20px;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 150ms, color 150ms;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .opcao.ativa {
    background-color: ${({ theme }) => theme.vars.palette.cores.tinta};
    color: ${({ theme }) => theme.vars.palette.cores.papel};
  }
`;
