import { Box, styled } from '@mui/material';

export const Conteudo = styled(Box)`
  .explicacao {
    margin-bottom: 16px;
  }

  .grupos {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .grupo {
    padding-left: 12px;
    border-left: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  }

  .grupo:first-of-type {
    padding-left: 0;
    border-left: 0;
  }

  .pequeno {
    font-size: 0.75rem;
    line-height: 1rem;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .pct {
    font-size: 2rem;
    line-height: 1.25;
  }

  .pct.fora {
    color: ${({ theme }) => theme.vars.palette.cores.alerta};
  }
`;
