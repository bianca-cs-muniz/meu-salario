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

  .dia {
    max-width: 6rem;
  }
` as typeof Box;
