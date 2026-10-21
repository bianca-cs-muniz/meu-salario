import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* Como no legado: texto à esquerda, interruptor à direita. */
  .interruptor {
    flex-direction: row-reverse;
    justify-content: space-between;
    gap: 16px;
  }
`;
