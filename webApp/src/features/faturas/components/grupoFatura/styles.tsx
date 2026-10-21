import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  .total {
    font-size: 0.875rem;
    font-weight: 600;
    font-variant-numeric: lining-nums tabular-nums;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .itens {
    margin: 0 -4px;
  }
`;
