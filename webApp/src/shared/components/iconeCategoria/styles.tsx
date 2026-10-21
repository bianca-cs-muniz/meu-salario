import { styled } from '@mui/material';

/** Círculo com o ícone da categoria. A cor vem dos dados (cor da categoria). */
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
  color: ${({ cor }) => `color-mix(in srgb, ${cor} 70%, white)`};
`;
