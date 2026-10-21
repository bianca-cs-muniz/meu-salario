import { Backdrop, styled } from '@mui/material';

export const Fundo = styled(Backdrop)`
  z-index: ${({ theme }) => theme.zIndex.drawer + 1};
  color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
`;
