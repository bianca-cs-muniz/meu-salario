import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    flex-direction: row;
    justify-content: space-between;
  }
`;
