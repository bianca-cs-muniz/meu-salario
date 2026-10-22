import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  .descricao {
    margin-bottom: 16px;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  .status.mudo {
    display: block;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .desde {
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
    font-variant-numeric: lining-nums tabular-nums;
  }

  .iconeTelegram {
    flex-shrink: 0;
    color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
  }

  .aguardando {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  /* Link com cara de botão primário: abre o bot direto no toque (sem window.open depois do await). */
  .abrirTelegram {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 999px;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    line-height: 1.5;
    text-decoration: none;
    transition: filter 150ms;
    background-color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
    color: ${({ theme }) => theme.vars.palette.cores.sobreDinheiro};

    &:hover {
      filter: brightness(1.1);
    }
  }

  .exemplos {
    margin-top: 20px;
    padding: 16px;
    border-radius: 12px;
    font-size: 0.875rem;
    background-color: ${({ theme }) => theme.vars.palette.cores.papel};
  }

  .tituloExemplos {
    margin-bottom: 8px;
    font-weight: 600;
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  .exemplos ul {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .mensagem {
    font-weight: 600;
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }
`;
