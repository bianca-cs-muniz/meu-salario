import { Box, styled } from '@mui/material';

export const Formulario = styled('form')`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Esqueletos = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/** "O estagiário anotou: …" */
export const AvisoEstagiario = styled(Box)`
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  background-color: ${({ theme }) => theme.vars.palette.cores.atencaoSuave};
  color: ${({ theme }) => theme.vars.palette.cores.atencao};
` as typeof Box;
