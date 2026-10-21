import { Box, styled } from '@mui/material';

export const Corpo = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 42rem;

  .blocos {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
`;
