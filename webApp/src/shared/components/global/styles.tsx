import { styled } from '@mui/material';
import { MaterialDesignContent } from 'notistack';

/** Toast em forma de pílula: sucesso no cofre (marinho profundo), erro no alerta. */
export const Pilula = styled(MaterialDesignContent)`
  &.notistack-MuiContent {
    max-width: 28rem;
    min-width: 0;
    padding: 6px 20px;
    border-radius: 999px;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.4;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    background-color: ${({ theme }) => theme.vars.palette.cores.cofre};
    color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
  }

  &.notistack-MuiContent-error {
    background-color: ${({ theme }) => theme.vars.palette.cores.alerta};
    color: ${({ theme }) => theme.vars.palette.error.contrastText};
  }
`;
