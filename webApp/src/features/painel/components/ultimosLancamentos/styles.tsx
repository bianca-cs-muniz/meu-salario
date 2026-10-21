import { styled } from '@mui/material';
import { Link } from 'react-router-dom';

export const VerTodos = styled(Link)`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.vars.palette.cores.latao};
`;

export const Lista = styled('ul')`
  margin: 0 -4px;
`;
