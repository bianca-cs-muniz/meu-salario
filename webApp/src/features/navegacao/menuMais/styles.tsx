import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .sair {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .sair:hover {
    background-color: ${({ theme }) => theme.vars.palette.cores.papel};
  }
` as typeof Box;
