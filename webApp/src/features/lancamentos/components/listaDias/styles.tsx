import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  .grupos {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .grupos.estreito {
    gap: 12px;
  }
`;
