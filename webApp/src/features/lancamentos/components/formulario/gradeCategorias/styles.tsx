import { styled } from '@mui/material';

export const Container = styled('fieldset')`
  legend {
    margin-bottom: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .grade {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;

    ${({ theme }) => theme.breakpoints.up('sm')} {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .categoria {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 4px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 150ms, background-color 150ms;
    border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  }

  .categoria:hover {
    border-color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .categoria.ativa {
    border-color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
    background-color: ${({ theme }) => theme.vars.palette.cores.dinheiroSuave};
  }

  .nome {
    max-width: 100%;
    padding: 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
