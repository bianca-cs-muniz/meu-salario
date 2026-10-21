import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;

  .busca {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
    background-color: ${({ theme }) => theme.vars.palette.cores.superficie};
    box-shadow: 0 2px 8px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 6%, transparent);
  }

  .busca:focus-within {
    border-color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
  }

  .busca .icone {
    flex-shrink: 0;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .busca input {
    width: 100%;
    border: 0;
    font: inherit;
    background-color: transparent;
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  .busca input:focus {
    outline: none;
  }

  .linha {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .pilula {
    flex-shrink: 0;
    padding: 6px 14px;
    border-radius: 999px;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
    background-color: ${({ theme }) => theme.vars.palette.cores.superficie};
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  .pilula:focus {
    outline: none;
  }

  .pilula:focus-visible {
    outline: 1.5px solid ${({ theme }) => theme.vars.palette.cores.latao};
    outline-offset: 2px;
  }

  select.pilula {
    padding-right: 12px;
  }

  .pilula.ativa {
    border-color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
  }

  .revisar.ativo {
    border-color: ${({ theme }) => theme.vars.palette.cores.atencao};
    background-color: ${({ theme }) => theme.vars.palette.cores.atencaoSuave};
    color: ${({ theme }) => theme.vars.palette.cores.atencao};
  }

  .limpar {
    flex-shrink: 0;
    padding: 0 8px;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    color: ${({ theme }) => theme.vars.palette.cores.latao};
  }

  /* No celular, campos com menos de 16px fazem o iOS dar zoom ao focar. */
  ${({ theme }) => theme.breakpoints.down('tablet')} {
    .busca input,
    select.pilula {
      font-size: 1rem;
    }
  }
`;
