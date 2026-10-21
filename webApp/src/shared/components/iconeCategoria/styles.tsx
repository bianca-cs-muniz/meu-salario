import { styled } from '@mui/material';

/**
 * Círculo com o ícone da categoria. A cor vem dos dados (cor da categoria, hex de 6 dígitos).
 * O traço é a cor misturada com 48% de `tinta` para ter contraste >= 3:1 no fundo claro
 * mesmo com as cores neon/claras da paleta (pior caso: o verde neon, ~3,2:1).
 */
export const Circulo = styled('span', {
  shouldForwardProp: (prop) => prop !== 'cor' && prop !== 'tamanho',
})<{ cor: string; tamanho: number }>`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  border-radius: 999px;
  width: ${({ tamanho }) => tamanho}px;
  height: ${({ tamanho }) => tamanho}px;
  background: ${({ cor }) => `${cor}1F`};
  box-shadow: inset 0 0 0 1px ${({ cor }) => `${cor}40`};
  color: ${({ theme, cor }) => `color-mix(in srgb, ${cor} 52%, ${theme.vars.palette.cores.tinta})`};
`;
