import { Box, ButtonBase, css, styled } from '@mui/material';

const base = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  padding: 10px 20px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.5;
  cursor: pointer;
  transition: background-color 150ms, border-color 150ms, filter 150ms, color 150ms;

  &.Mui-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: auto;
  }

  &.larguraTotal {
    width: 100%;
  }
`;

export const Primario = styled(ButtonBase)`
  ${base}
  background-color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
  color: ${({ theme }) => theme.vars.palette.cores.sobreDinheiro};

  &:hover {
    filter: brightness(1.1);
  }
`;

export const Secundario = styled(ButtonBase)`
  ${base}
  background-color: transparent;
  color: ${({ theme }) => theme.vars.palette.cores.tinta};
  border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};

  &:hover {
    border-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 40%, transparent);
  }
`;

export const Fantasma = styled(ButtonBase)`
  ${base}
  background-color: transparent;
  color: ${({ theme }) => theme.vars.palette.cores.latao};

  &:hover {
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.dinheiroSuave} 70%, transparent);
  }

  &.perigo {
    color: ${({ theme }) => theme.vars.palette.cores.alerta};
  }

  &.perigo:hover {
    background-color: ${({ theme }) => theme.vars.palette.cores.alertaSuave};
  }
`;

export const Perigo = styled(ButtonBase)`
  ${base}
  background-color: ${({ theme }) => theme.vars.palette.cores.alerta};
  color: ${({ theme }) => theme.vars.palette.error.contrastText};

  &:hover {
    filter: brightness(1.1);
  }
`;

export const Grupo = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &.fim {
    ${({ theme }) => theme.breakpoints.up('sm')} {
      justify-content: flex-end;
    }
  }

  &.entre {
    flex-direction: column-reverse;

    ${({ theme }) => theme.breakpoints.up('sm')} {
      flex-direction: row;
      justify-content: space-between;
    }
  }
`;
