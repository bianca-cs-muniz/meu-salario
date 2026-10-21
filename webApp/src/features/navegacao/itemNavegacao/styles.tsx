import { styled } from '@mui/material';
import { Link } from 'react-router-dom';

export const LinkNavegacao = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.93rem;
  font-weight: 500;

  /* Fundo claro (menu "Mais") */
  color: ${({ theme }) => theme.vars.palette.cores.tinta};

  &:hover {
    background-color: ${({ theme }) => theme.vars.palette.cores.papel};
  }

  &.ativo {
    background-color: ${({ theme }) => theme.vars.palette.cores.dinheiroSuave};
  }

  /* Fundo escuro (barra lateral) */
  &.escuro {
    color: ${({ theme }) => theme.vars.palette.cores.cofreMudo};
  }

  &.escuro:hover {
    background-color: transparent;
    color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
  }

  &.escuro.ativo {
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofreTinta} 7%, transparent);
    color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
  }

  .marcador {
    position: absolute;
    left: -20px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background-color: ${({ theme }) => theme.vars.palette.cores.latao};
  }
`;
