import { styled } from '@mui/material';

export const Item = styled('li')`
  .botao {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 12px;
    padding: 10px 4px;
    border-radius: 12px;
    text-align: left;
    cursor: pointer;
  }

  .botao:hover {
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.papel} 70%, transparent);
  }

  .botao.inativa {
    opacity: 0.5;
  }

  .meio {
    display: block;
    flex: 1;
    min-width: 0;
  }

  .linha {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .nome {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
  }

  .vr {
    margin-left: 8px;
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 0.75rem;
    background-color: ${({ theme }) => theme.vars.palette.cores.dinheiroSuave};
    color: ${({ theme }) => theme.vars.palette.cores.latao};
  }

  .gasto {
    flex-shrink: 0;
    font-size: 0.875rem;
    font-variant-numeric: lining-nums tabular-nums;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .gasto.passou {
    font-weight: 600;
    color: ${({ theme }) => theme.vars.palette.cores.alerta};
  }

  .limite {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
  }

  .textoLimite {
    flex-shrink: 0;
    font-size: 0.75rem;
    font-variant-numeric: lining-nums tabular-nums;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }
`;
