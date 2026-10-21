import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
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

  .status strong {
    font-variant-numeric: lining-nums tabular-nums;
  }

  .iconeWhatsapp {
    flex-shrink: 0;
    color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
  }

  .formulario {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 4px;

    ${({ theme }) => theme.breakpoints.up('sm')} {
      flex-direction: row;
      align-items: flex-end;
    }
  }

  .campo {
    flex: 1;
  }

  .desvincular {
    margin-top: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    color: ${({ theme }) => theme.vars.palette.cores.alerta};
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
