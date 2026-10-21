import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  display: flex;
  align-items: baseline;
  gap: 8px;
  border-color: ${({ theme }) => theme.vars.palette.cores.linha};

  &:focus-within {
    border-color: ${({ theme }) => theme.vars.palette.cores.latao};
  }

  &.pequeno {
    padding: 10px 14px;
    border-radius: 8px;
    border-width: 1px;
    border-style: solid;
    background-color: ${({ theme }) => theme.vars.palette.cores.superficie2};
  }

  &.grande {
    padding-bottom: 8px;
    border-bottom-width: 1px;
    border-bottom-style: solid;
  }

  .moeda {
    font-size: 1rem;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  &.grande .moeda {
    font-family: "Cormorant Garamond", "Iowan Old Style", Georgia, serif;
    font-weight: 600;
    font-size: 1.875rem;
    line-height: 2.25rem;
  }

  input {
    width: 100%;
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    font-size: 1rem;
    font-variant-numeric: lining-nums tabular-nums;
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  input:focus,
  input:focus-visible {
    outline: none;
  }

  input::placeholder {
    color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.mudo} 50%, transparent);
  }

  &.grande input {
    font-family: "Cormorant Garamond", "Iowan Old Style", Georgia, serif;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-size: 3.75rem;
    line-height: 1;
  }
`;
