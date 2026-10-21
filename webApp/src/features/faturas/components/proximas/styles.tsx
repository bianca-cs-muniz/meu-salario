import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  .legenda {
    margin-bottom: 12px;
  }

  .lista {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .botao {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 6px 8px;
    border-radius: 12px;
    cursor: pointer;
  }

  .botao:hover {
    background-color: ${({ theme }) => theme.vars.palette.cores.papel};
  }

  .valor {
    font-weight: 600;
    font-variant-numeric: lining-nums tabular-nums;
  }
`;
