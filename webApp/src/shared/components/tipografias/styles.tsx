import { css, styled, Typography } from '@mui/material';

const serifa = css`
  font-family: "Cormorant Garamond", "Iowan Old Style", Georgia, serif;
  font-weight: 600;
  letter-spacing: -0.01em;
  font-feature-settings: "lnum" 1, "pnum" 1;
`;

/** Título da página: Cormorant 2.6rem (3rem a partir do tablet). */
export const Titulo = styled(Typography)`
  ${serifa}
  font-size: 2.6rem;
  line-height: 1;
  color: inherit;

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    font-size: 3rem;
  }
` as typeof Typography;

/** Título grande das telas públicas (login / criar conta). */
export const TituloTela = styled(Typography)`
  ${serifa}
  font-size: 3.75rem;
  line-height: 1;
  color: inherit;
` as typeof Typography;

/** Nome do app ("Meu Salário"). */
export const Marca = styled(Typography)`
  ${serifa}
  font-size: 1.5rem;
  line-height: 1;
  color: inherit;
` as typeof Typography;

/** Título de bloco / modal. */
export const TituloBloco = styled(Typography)`
  ${serifa}
  font-size: 1.45rem;
  line-height: 1.25;
  color: inherit;
` as typeof Typography;

/** Valores em dinheiro: serifa com algarismos tabulares. */
export const Valor = styled(Typography)`
  ${serifa}
  font-variant-numeric: lining-nums tabular-nums;
  font-size: 1.2rem;
  line-height: 1;
  color: inherit;
` as typeof Typography;

/** Texto secundário (mudo). */
export const Legenda = styled(Typography)`
  font-size: 15.5px;
  line-height: 1.5;
  color: ${({ theme }) => theme.vars.palette.cores.mudo};
` as typeof Typography;

/** Texto secundário pequeno (text-sm mudo). */
export const LegendaSimples = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.vars.palette.cores.mudo};
` as typeof Typography;

/** Texto normal na cor da tinta. */
export const TextoSimples = styled(Typography)`
  font-size: 15.5px;
  line-height: 1.5;
  color: ${({ theme }) => theme.vars.palette.cores.tinta};
` as typeof Typography;

/** Texto em destaque (semibold). */
export const TextoForte = styled(Typography)`
  font-size: 15.5px;
  font-weight: 600;
  line-height: 1.5;
  color: ${({ theme }) => theme.vars.palette.cores.tinta};
` as typeof Typography;

/** Números com algarismos tabulares, na fonte do texto. */
export const Numero = styled(Typography)`
  font-size: inherit;
  font-weight: 600;
  line-height: inherit;
  font-variant-numeric: lining-nums tabular-nums;
  color: inherit;
` as typeof Typography;
