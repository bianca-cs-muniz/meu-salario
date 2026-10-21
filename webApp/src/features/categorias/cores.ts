import type { GrupoCategoria } from '@services/tipos';

/**
 * Paleta de cores que a pessoa pode escolher para uma categoria (mesma lista do legado).
 * São dados (a API guarda o hex), não cores do tema.
 */
export const CORES_CATEGORIA = [
  '#2962FF',
  '#304FFE',
  '#009DFF',
  '#00CFE8',
  '#0077B6',
  '#FF1493',
  '#F50057',
  '#D500F9',
  '#FF48B0',
  '#AA00FF',
  '#00A86B',
  '#39FF14',
  '#00C853',
  '#00BFA5',
  '#AEEA00',
  '#7C4DFF',
  '#FF6D00',
  '#FFD600',
  '#FF1744',
  '#FF5252',
  '#FF9100',
  '#651FFF',
];

/** Ordem dos grupos na tela e no formulário. */
export const GRUPOS: GrupoCategoria[] = ['ESSENCIAL', 'DESEJO', 'POUPANCA'];
