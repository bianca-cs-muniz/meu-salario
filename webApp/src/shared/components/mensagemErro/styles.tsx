import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${({ theme }) => theme.vars.palette.cores.alerta};
` as typeof Box;
