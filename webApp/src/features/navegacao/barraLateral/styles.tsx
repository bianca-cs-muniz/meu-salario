import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  position: sticky;
  top: 0;
  display: none;
  flex-direction: column;
  flex-shrink: 0;
  width: 16rem;
  height: 100vh;
  padding: 32px 20px;
  background-color: ${({ theme }) => theme.vars.palette.cores.cofre};
  color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
  border-right: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    display: flex;
  }

  .logo {
    display: block;
    margin-bottom: 40px;
    padding: 0 12px;
  }

  .logo-texto {
    display: block;
    font-size: 1.7rem;
  }

  .traco {
    display: block;
    width: 32px;
    height: 1px;
    margin-top: 12px;
    background-color: ${({ theme }) => theme.vars.palette.cores.latao};
  }

  .novo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 32px;
    padding: 10px 16px;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.latao} 70%, transparent);
    color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
  }

  .novo:hover {
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.latao} 15%, transparent);
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sair {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: auto;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.875rem;
    cursor: pointer;
    color: ${({ theme }) => theme.vars.palette.cores.cofreMudo};
  }

  .sair:hover {
    color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
  }
` as typeof Box;
