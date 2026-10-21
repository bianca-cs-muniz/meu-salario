import { styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { CLASSE_STATUS_FATURA } from '@constants/rotulos';
import type { StatusFatura } from '@services/tipos';

export const Lista = styled('ul')`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ItemFatura = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  border-radius: 8px;

  &:hover {
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.papel} 60%, transparent);
  }

  .meio {
    flex: 1;
    min-width: 0;
  }

  .nome {
    display: block;
    font-weight: 600;
  }

  .vencimento {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .direita {
    text-align: right;
  }

  .total {
    display: block;
    font-size: 1.25rem;
    line-height: 1.25;
  }

  .status {
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* Uma classe por status, com os tokens de CLASSE_STATUS_FATURA. */
  ${({ theme }) =>
    (Object.keys(CLASSE_STATUS_FATURA) as StatusFatura[])
      .map((s) => {
        const { fundo, texto } = CLASSE_STATUS_FATURA[s];
        return `.status-${s} { background-color: ${theme.vars.palette.cores[fundo]}; color: ${theme.vars.palette.cores[texto]}; }`;
      })
      .join('\n')}
`;

/** Faixa fina na cor do cartão (dado da API). */
export const Faixa = styled('span', {
  shouldForwardProp: (prop) => prop !== 'cor',
})<{ cor: string }>`
  width: 3px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 999px;
  background: ${({ cor }) => cor};
`;
