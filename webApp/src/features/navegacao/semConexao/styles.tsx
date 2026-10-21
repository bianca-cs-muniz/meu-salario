import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background-color: ${({ theme }) => theme.vars.palette.cores.papel};

  .conteudo {
    max-width: 24rem;
  }

  .titulo {
    margin-bottom: 8px;
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .texto {
    margin-bottom: 20px;
  }
` as typeof Box;
