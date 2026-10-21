import { Box, styled } from '@mui/material';

export const Secao = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 24px;

  .titulo {
    font-size: 3rem;
    line-height: 1.02;
  }

  .explicacao {
    margin-top: 12px;
  }

  .adicionados {
    padding: 8px 12px;
    border-radius: 12px;
    background-color: ${({ theme }) => theme.vars.palette.cores.dinheiroSuave};
    color: ${({ theme }) => theme.vars.palette.cores.latao};
  }

  .dias {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .acoes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
` as typeof Box;
