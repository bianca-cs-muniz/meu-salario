import { Skeleton, styled } from '@mui/material';

export const Barra = styled(Skeleton)`
  border-radius: 12px;
  transform: none;
  background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.linha} 60%, transparent);
`;
