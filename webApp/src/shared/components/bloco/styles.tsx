import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  padding: 20px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  background-color: ${({ theme }) => theme.vars.palette.cores.superficie};
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    padding: 24px;
  }

  .cabecalho {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  }
` as typeof Box;
