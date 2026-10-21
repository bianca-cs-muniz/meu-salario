import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;

  .rotulo {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.vars.palette.cores.cofreMudo};
  }

  .valor {
    margin: 0;
    font-family: "Cormorant Garamond", "Iowan Old Style", Georgia, serif;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-variant-numeric: lining-nums tabular-nums;
    font-size: 1.5rem;
    line-height: 1;

    ${({ theme }) => theme.breakpoints.up('tablet')} {
      font-size: 1.75rem;
    }
  }
`;
