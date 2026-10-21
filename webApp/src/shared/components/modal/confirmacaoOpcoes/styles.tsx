import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  .texto {
    margin-bottom: 20px;
  }
`;

export const Opcoes = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .opcao {
    padding: 10px 20px;
    border-radius: 999px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
    background-color: ${({ theme }) => theme.vars.palette.cores.superficie};
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  .opcao:hover {
    background-color: ${({ theme }) => theme.vars.palette.cores.superficie2};
  }

  .opcao.perigo {
    border-color: transparent;
    background-color: ${({ theme }) => theme.vars.palette.cores.alerta};
    color: ${({ theme }) => theme.vars.palette.error.contrastText};
  }

  .cancelar {
    padding: 8px 16px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }
`;
