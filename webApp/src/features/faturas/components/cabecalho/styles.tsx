import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  .voltar {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .voltar:hover {
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  .linha {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 24px;
  }

  .titulo {
    font-size: 3rem;
  }

  nav {
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  }

  .seta {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    cursor: pointer;
  }

  .seta:hover {
    background-color: ${({ theme }) => theme.vars.palette.cores.papel};
  }

  .mes {
    min-width: 9rem;
    text-align: center;
    font-size: 1.125rem;
    line-height: 1;
  }
`;
