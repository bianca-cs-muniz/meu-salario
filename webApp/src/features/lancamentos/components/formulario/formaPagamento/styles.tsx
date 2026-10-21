import { styled } from '@mui/material';

export const Container = styled('fieldset')`
  display: flex;
  flex-direction: column;
  gap: 8px;

  legend {
    margin-bottom: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .saldo {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .saldo strong {
    font-variant-numeric: lining-nums tabular-nums;
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }
`;
