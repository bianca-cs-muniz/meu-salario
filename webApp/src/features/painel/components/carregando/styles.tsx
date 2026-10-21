import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 24px;

  .destaque > * {
    border-radius: 16px;
  }

  .colunas {
    display: grid;
    gap: 24px;

    ${({ theme }) => theme.breakpoints.up('laptop')} {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;
