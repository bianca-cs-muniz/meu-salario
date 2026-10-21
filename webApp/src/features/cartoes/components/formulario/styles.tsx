import { Box, styled } from '@mui/material';

export const Formulario = styled('form')`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Dias = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

/** Rótulo envolvendo o campo de dinheiro (mesmo visual do rótulo dos inputs). */
export const Rotulo = styled('label')`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.vars.palette.cores.mudo};
`;

export const Cores = styled('fieldset')`
  legend {
    margin-bottom: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .opcoes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* O fundo de cada bolinha é a própria cor do cartão (dado), aplicada via style. */
  .cor {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    border: 2px solid transparent;
    cursor: pointer;
  }

  .cor.ativa {
    border-color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }
`;

export const Rodape = styled(Box)`
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    flex-direction: row;
    justify-content: space-between;
  }
`;
