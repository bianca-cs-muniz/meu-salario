import { styled } from '@mui/material';

export const Lista = styled('ul')`
  display: flex;
  flex-direction: column;
  gap: 16px;

  li {
    display: flex;
    align-items: center;
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
    gap: 8px;
    margin-bottom: 6px;
  }

  .nome {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
  }

  .valor {
    flex-shrink: 0;
    font-size: 0.875rem;
    font-variant-numeric: lining-nums tabular-nums;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .valor.passou {
    font-weight: 600;
    color: ${({ theme }) => theme.vars.palette.cores.alerta};
  }
`;
