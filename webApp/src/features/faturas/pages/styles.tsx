import { Box, styled } from '@mui/material';

export const Corpo = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Esqueletos = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Conteudo = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Colunas = styled(Box)`
  display: grid;
  gap: 24px;

  ${({ theme }) => theme.breakpoints.up('laptop')} {
    grid-template-columns: 1.3fr 1fr;
  }

  .coluna {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }
`;
