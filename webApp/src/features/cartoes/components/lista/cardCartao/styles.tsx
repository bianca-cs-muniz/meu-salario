import { styled } from '@mui/material';

export const Card = styled('li')`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  background-color: ${({ theme }) => theme.vars.palette.cores.superficie};
  box-shadow:
    0 4px 14px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 8%, transparent),
    0 1px 3px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 5%, transparent);
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow:
      0 8px 20px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 12%, transparent),
      0 2px 4px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 6%, transparent);
    transform: translateY(-2px);
  }

  .link {
    display: block;
    padding: 12px;
  }

  .link:hover {
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.papel} 40%, transparent);
  }

  /* Face do cartão: o fundo é a cor do cartão (dado do banco), aplicada via style. */
  .face {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    aspect-ratio: 1.9 / 1;
    padding: 20px;
    border-radius: 8px;
    color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
  }

  .brilho,
  .sombra {
    position: absolute;
    inset: 0;
  }

  .brilho {
    background: radial-gradient(
      120% 90% at 100% 0%,
      color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofreTinta} 16%, transparent),
      transparent 60%
    );
  }

  .sombra {
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofre} 15%, transparent);
  }

  .nome {
    position: relative;
    font-size: 1.9rem;
    line-height: 1;
  }

  .rodapeFace {
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.8rem;
    color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofreTinta} 75%, transparent);
  }

  .chip {
    width: 40px;
    height: 28px;
    border-radius: 6px;
    opacity: 0.9;
    border: 1px solid color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofreTinta} 30%, transparent);
    background: linear-gradient(
      to bottom right,
      ${({ theme }) => theme.vars.palette.cores.latao},
      color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.latao} 55%, ${({ theme }) => theme.vars.palette.cores.dinheiro})
    );
  }

  .info {
    padding: 20px 8px 8px;
  }

  .fatura {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
  }

  .total {
    margin-top: 4px;
    font-size: 2.4rem;
  }

  .status {
    text-align: right;
  }

  .vence {
    margin-top: 6px;
  }

  .limite {
    margin-top: 20px;
  }

  .linhaLimite {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .numero {
    font-variant-numeric: lining-nums tabular-nums;
  }

  .editar {
    position: absolute;
    top: 24px;
    right: 24px;
    padding: 8px;
    border-radius: 999px;
    cursor: pointer;
    color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofreTinta} 80%, transparent);
  }

  .editar:hover {
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofreTinta} 15%, transparent);
  }
`;
