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
  box-shadow:
    0 4px 14px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 8%, transparent),
    0 1px 3px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 5%, transparent);
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow:
      0 6px 18px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 12%, transparent),
      0 2px 4px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 6%, transparent);
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
