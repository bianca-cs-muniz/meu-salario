import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr);

  &.duasColunas {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fatura {
    grid-column: 1 / -1;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .fatura strong {
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }
`;
