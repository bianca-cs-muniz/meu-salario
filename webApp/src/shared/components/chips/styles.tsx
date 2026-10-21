import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .chip {
    padding: 6px 16px;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 150ms, background-color 150ms;
    border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
    background-color: transparent;
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  .chip:hover {
    border-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 40%, transparent);
  }

  .chip.ativo {
    border-color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
    background-color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
    color: ${({ theme }) => theme.vars.palette.cores.sobreDinheiro};
  }
`;
