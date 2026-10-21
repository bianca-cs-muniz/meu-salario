import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  padding: 16px;
  border-radius: 12px;
  font-size: 0.875rem;
  border: 1px solid color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.alerta} 30%, transparent);
  background-color: ${({ theme }) => theme.vars.palette.cores.alertaSuave};

  .mensagem {
    margin-bottom: 12px;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }
`;
