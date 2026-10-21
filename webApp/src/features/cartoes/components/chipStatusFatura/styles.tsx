import { Box, styled } from '@mui/material';
import { CLASSE_STATUS_FATURA } from '@constants/rotulos';
import type { StatusFatura } from '@services/tipos';

export const Chip = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: StatusFatura }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1rem;
  background-color: ${({ theme, status }) => theme.vars.palette.cores[CLASSE_STATUS_FATURA[status].fundo]};
  color: ${({ theme, status }) => theme.vars.palette.cores[CLASSE_STATUS_FATURA[status].texto]};
`;
