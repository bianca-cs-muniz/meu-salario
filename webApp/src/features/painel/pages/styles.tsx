import { Box, styled } from '@mui/material';

export const Corpo = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;

  .topo {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .colunas {
    display: grid;
    gap: 24px;

    ${({ theme }) => theme.breakpoints.up('laptop')} {
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    }
  }

  .coluna {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }
`;
