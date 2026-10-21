import { Box, styled } from '@mui/material';

/** Faixa do aviso de nova versão: no cofre, acima da barra inferior no celular e no canto no desktop. */
export const Container = styled(Box)`
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(5.5rem + env(safe-area-inset-bottom));
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 10px 10px 20px;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${({ theme }) => theme.vars.palette.cores.cofre};
  color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
  box-shadow:
    0 10px 15px -3px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 18%, transparent),
    0 4px 6px -4px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 18%, transparent);

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    left: auto;
    right: 24px;
    bottom: 24px;
    max-width: 28rem;
  }

  .acoes {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .acao {
    padding: 6px 14px;
    border-radius: 999px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .acao.secundaria {
    color: ${({ theme }) => theme.vars.palette.cores.cofreMudo};
  }

  .acao.principal {
    background-color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
    color: ${({ theme }) => theme.vars.palette.cores.sobreDinheiro};
  }
`;
