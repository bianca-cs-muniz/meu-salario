import { styled } from '@mui/material';
import { Link } from 'react-router-dom';

export const Aviso = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  border-left: 3px solid ${({ theme }) => theme.vars.palette.cores.latao};
  background-color: ${({ theme }) => theme.vars.palette.cores.superficie};
  color: ${({ theme }) => theme.vars.palette.cores.tinta};
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05);
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12), 0 2px 4px rgba(15, 23, 42, 0.06);
    transform: translateY(-1px);
  }

  .icone {
    flex-shrink: 0;
    color: ${({ theme }) => theme.vars.palette.cores.latao};
  }

  .texto {
    font-weight: 500;
  }
`;
