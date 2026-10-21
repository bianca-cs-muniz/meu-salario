import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  background-color: ${({ theme }) => theme.vars.palette.cores.superficie};
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04);

  .cabecalho {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .dia {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .saidas {
    font-variant-numeric: lining-nums tabular-nums;
  }

  .itens {
    margin: 0 -4px;
  }
` as typeof Box;
