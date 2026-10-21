import { Box, styled } from '@mui/material';

export const Formulario = styled('form')`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/** Ícone escolhido + campo de nome. */
export const Topo = styled(Box)`
  display: flex;
  align-items: flex-end;
  gap: 12px;

  .nome {
    flex: 1;
  }
`;

export const Grupo = styled('fieldset')`
  legend {
    margin-bottom: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .icones {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px;

    ${({ theme }) => theme.breakpoints.up('sm')} {
      grid-template-columns: repeat(9, minmax(0, 1fr));
    }
  }

  .icone {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .icone:hover {
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  .icone.ativo {
    border-color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
    background-color: ${({ theme }) => theme.vars.palette.cores.dinheiroSuave};
    color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
  }

  .cores {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

/** Bolinha de cor. A cor vem da paleta de opções da categoria (dado, não tema). */
export const Amostra = styled('button', {
  shouldForwardProp: (prop) => prop !== 'cor',
})<{ cor: string }>`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  cursor: pointer;
  border: 2px solid transparent;
  background: ${({ cor }) => cor};

  &.ativa {
    border-color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }
`;

/** Rótulo em volta do campo de dinheiro (mesmo visual dos rótulos do InputCustomizado). */
export const Campo = styled('label')`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.vars.palette.cores.mudo};

  .dica {
    font-size: 0.75rem;
    font-weight: 400;
  }
`;
