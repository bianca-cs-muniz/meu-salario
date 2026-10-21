import { styled } from '@mui/material';

/** Campo + botão: empilhados no celular, lado a lado a partir de sm. */
export const Formulario = styled('form')`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 4px;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    flex-direction: row;
    align-items: flex-end;
  }

  .campo {
    flex: 1;
  }
`;
