import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  position: sticky;
  bottom: calc(4.75rem + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.875rem;
  border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  background-color: ${({ theme }) => theme.vars.palette.cores.superficie};
  color: ${({ theme }) => theme.vars.palette.cores.tinta};
  box-shadow:
    0 8px 24px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 12%, transparent),
    0 2px 6px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.tinta} 6%, transparent);

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    bottom: 16px;
  }

  .entradas {
    color: ${({ theme }) => theme.vars.palette.cores.credito};
  }
`;
