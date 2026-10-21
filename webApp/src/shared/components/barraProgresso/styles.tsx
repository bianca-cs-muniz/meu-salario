import { Box, styled } from '@mui/material';

export const Trilho = styled(Box)`
  width: 100%;
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.linha} 70%, transparent);
`;

export const Preenchimento = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'pct' && prop !== 'cor' && prop !== 'alerta',
})<{ pct: number; cor?: string; alerta?: boolean }>`
  height: 100%;
  border-radius: 999px;
  transition: width 500ms;
  width: ${({ pct }) => pct}%;
  background: ${({ theme, cor, alerta }) =>
    alerta ? theme.vars.palette.cores.alerta : (cor ?? theme.vars.palette.cores.dinheiro)};
`;
