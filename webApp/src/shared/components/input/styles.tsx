import { Box, Checkbox, css, styled } from '@mui/material';

/** Rótulo do campo (o `label` envolve o controle, como no antigo `Campo`). */
export const Rotulo = styled('label')`
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

const entrada = css`
  width: 100%;
  min-width: 0;
  padding: 10px 14px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  outline: none;
`;

export const Entrada = styled('input')`
  ${entrada}
  border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  background-color: ${({ theme }) => theme.vars.palette.cores.superficie2};
  color: ${({ theme }) => theme.vars.palette.cores.tinta};

  &::placeholder {
    color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.mudo} 60%, transparent);
  }

  &:focus,
  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.vars.palette.cores.latao};
  }

  &[aria-invalid="true"] {
    border-color: ${({ theme }) => theme.vars.palette.cores.alerta};
  }
`;

export const Selecao = styled('select')`
  ${entrada}
  border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  background-color: ${({ theme }) => theme.vars.palette.cores.superficie2};
  color: ${({ theme }) => theme.vars.palette.cores.tinta};

  &:focus,
  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.vars.palette.cores.latao};
  }
`;

export const ContainerCheckBox = styled(Box)`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.vars.palette.cores.tinta};
` as typeof Box;

export const CaixaMarcacao = styled(Checkbox)`
  padding: 6px;
  color: ${({ theme }) => theme.vars.palette.cores.mudo};

  &.Mui-checked {
    color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
  }
`;
