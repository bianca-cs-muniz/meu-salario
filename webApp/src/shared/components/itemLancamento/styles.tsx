import { styled } from '@mui/material';

export const Item = styled('li')`
  .botao {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 14px;
    padding: 12px 4px;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
  }

  .botao:hover {
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.papel} 60%, transparent);
  }

  .meio {
    display: block;
    flex: 1;
    min-width: 0;
  }

  .linha {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .descricao {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .whatsapp,
  .telegram {
    flex-shrink: 0;
    color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
  }

  .fixo {
    flex-shrink: 0;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .detalhes {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .detalhes .texto {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .revisar {
    flex-shrink: 0;
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    background-color: ${({ theme }) => theme.vars.palette.cores.atencaoSuave};
    color: ${({ theme }) => theme.vars.palette.cores.atencao};
  }

  .valor {
    flex-shrink: 0;
  }

  .valor.entrada {
    color: ${({ theme }) => theme.vars.palette.cores.credito};
  }
`;
