import { Box, styled } from '@mui/material';

/** Posiciona a janela: embaixo (bottom-sheet) no celular, centralizada a partir do tablet. */
export const Posicionador = styled(Box)`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  outline: none;

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    align-items: center;
    padding: 0 16px;
  }
`;

export const Janela = styled(Box)`
  width: 100%;
  max-width: 32rem;
  max-height: 92vh;
  overflow-y: auto;
  padding: 20px 20px calc(1.25rem + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background-color: ${({ theme }) => theme.vars.palette.cores.superficie};
  color: ${({ theme }) => theme.vars.palette.cores.tinta};
  outline: none;
  border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  box-shadow: 0 20px 35px -5px rgba(15, 23, 42, 0.16), 0 10px 15px -5px rgba(15, 23, 42, 0.08);

  &.estreita {
    max-width: 24rem;
  }

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    padding: 24px;
    border-radius: 24px;
  }
`;

export const Cabecalho = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    font-size: 1.75rem;
    line-height: 1;
  }

  .fechar {
    display: grid;
    place-items: center;
    padding: 6px;
    border-radius: 8px;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
    cursor: pointer;
  }

  .fechar:hover {
    background-color: ${({ theme }) => theme.vars.palette.cores.papel};
  }
`;
