import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: ${({ theme }) => theme.vars.palette.cores.papel};

  .conteudo {
    width: 100%;
    max-width: 24rem;
  }

  .marca {
    margin-bottom: 3.5rem;
  }

  .traco {
    display: block;
    width: 32px;
    height: 1px;
    margin-top: 12px;
    background-color: ${({ theme }) => theme.vars.palette.cores.latao};
  }

  .subtitulo {
    margin-top: 16px;
    margin-bottom: 40px;
  }
` as typeof Box;
