import { styled } from '@mui/material';

export const Card = styled('li')`
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  background-color: ${({ theme }) => theme.vars.palette.cores.superficie};
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05);

  .topo {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .meio {
    flex: 1;
    min-width: 0;
  }

  .linha {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .descricao {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .valor {
    flex-shrink: 0;
    font-variant-numeric: lining-nums tabular-nums;
  }

  .valor.entrada {
    color: ${({ theme }) => theme.vars.palette.cores.credito};
  }

  .observacao {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 0.875rem;
    background-color: ${({ theme }) => theme.vars.palette.cores.papel};
  }

  .observacao svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
  }

  .acoes {
    margin-top: 12px;
  }
`;
