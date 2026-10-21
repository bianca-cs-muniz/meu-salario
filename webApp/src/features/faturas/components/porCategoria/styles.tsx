import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  .lista {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .meio {
    flex: 1;
    min-width: 0;
  }

  .linha {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 0.875rem;
  }

  .nome {
    font-weight: 600;
  }

  .valor {
    font-variant-numeric: lining-nums tabular-nums;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }
`;
