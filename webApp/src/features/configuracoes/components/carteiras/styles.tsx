import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  .itens {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  }

  .renomear {
    display: flex;
    flex: 1;
    gap: 8px;
  }

  .meio {
    display: block;
    flex: 1;
    min-width: 0;
  }

  .nome {
    display: block;
    font-weight: 600;
  }

  .tipo {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .saldo {
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  .editar {
    display: grid;
    place-items: center;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .editar:hover {
    background-color: ${({ theme }) => theme.vars.palette.cores.papel};
  }

  .adicionarVr {
    margin-top: 12px;
  }
`;
