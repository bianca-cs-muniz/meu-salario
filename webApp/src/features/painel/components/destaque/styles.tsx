import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  position: relative;
  overflow: hidden;
  padding: 28px 24px 24px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.vars.palette.cores.cofre};
  color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
  border: 1px solid color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofreTinta} 10%, transparent);
  box-shadow:
    0 10px 25px -5px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofre} 25%, transparent),
    0 8px 10px -6px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofre} 12%, transparent);

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    padding: 36px 36px 32px;
  }

  .fio {
    position: absolute;
    top: 0;
    left: 24px;
    right: 24px;
    height: 1px;
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.latao} 70%, transparent);

    ${({ theme }) => theme.breakpoints.up('tablet')} {
      left: 36px;
      right: 36px;
    }
  }

  .rotulo {
    font-size: 0.82rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.vars.palette.cores.cofreMudo};
  }

  .sobra {
    margin-top: 8px;
    line-height: 0.9;
  }

  .sobra.negativo {
    color: ${({ theme }) => theme.vars.palette.cores.cofreDestaque};
  }

  .inteiro {
    font-size: clamp(3.6rem, 16vw, 6.2rem);
  }

  .centavos {
    font-size: clamp(1.6rem, 5vw, 2.6rem);
    color: ${({ theme }) => theme.vars.palette.cores.cofreMudo};
  }

  .entradas {
    margin-top: 12px;
    color: ${({ theme }) => theme.vars.palette.cores.cofreMudo};
  }

  .entradasValor {
    color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
  }

  .regua {
    display: flex;
    height: 8px;
    margin-top: 28px;
    overflow: hidden;
    border-radius: 999px;
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofreTinta} 10%, transparent);
  }

  .legenda {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin-top: 12px;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.vars.palette.cores.cofreMudo};
  }

  .legenda li {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .numeros {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px 24px;
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofreTinta} 10%, transparent);

    ${({ theme }) => theme.breakpoints.up('sm')} {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
` as typeof Box;

/** Fatia da régua. A cor vem da categoria (dado da API). */
export const Segmento = styled('span', {
  shouldForwardProp: (prop) => prop !== 'pct' && prop !== 'cor',
})<{ pct: number; cor: string }>`
  height: 100%;
  flex: 0 0 ${({ pct }) => pct}%;
  background: ${({ cor }) => cor};
  border-right: 1px solid ${({ theme }) => theme.vars.palette.cores.cofre};
  transition: flex-basis 500ms;

  &:last-of-type {
    border-right: 0;
  }
`;

/** Bolinha da legenda, na cor da categoria. */
export const Ponto = styled('span', {
  shouldForwardProp: (prop) => prop !== 'cor',
})<{ cor: string }>`
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: ${({ cor }) => cor};
`;
