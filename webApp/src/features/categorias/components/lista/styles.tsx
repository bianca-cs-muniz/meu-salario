import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .grupo {
    width: 100%;
    margin-bottom: 24px;
  }

  /* No legado o título do grupo tinha menos espaço abaixo que o Bloco padrão. */
  .grupo .cabecalho {
    margin-bottom: 8px;
  }

  .itens {
    display: flex;
    flex-direction: column;
  }

  .alternarInativas {
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    color: ${({ theme }) => theme.vars.palette.cores.latao};
  }
`;
