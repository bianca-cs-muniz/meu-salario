import { Box, styled } from '@mui/material';

export const Formulario = styled('form')`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/** Valor + Dia lado a lado. */
export const Linha = styled(Box)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 6rem;
  gap: 12px;
`;

/** Rótulo em volta do campo de dinheiro (mesmo visual dos rótulos do InputCustomizado). */
export const Campo = styled('label')`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.vars.palette.cores.mudo};
`;

export const Grupo = styled('fieldset')`
  legend {
    margin-bottom: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }
`;
