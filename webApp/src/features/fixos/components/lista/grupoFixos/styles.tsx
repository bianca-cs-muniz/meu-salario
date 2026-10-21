import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  .total,
  .valor {
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  .total.entrada,
  .valor.entrada {
    color: ${({ theme }) => theme.vars.palette.cores.credito};
  }

  .itens {
    margin: 0 -4px;
  }

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

  .meio {
    display: block;
    flex: 1;
    min-width: 0;
  }

  .descricao {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
  }

  .detalhes {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .valor {
    flex-shrink: 0;
  }
`;
