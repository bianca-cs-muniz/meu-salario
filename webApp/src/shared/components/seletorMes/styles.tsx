import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;

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

  .hoje {
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    color: ${({ theme }) => theme.vars.palette.cores.latao};
  }
`;
