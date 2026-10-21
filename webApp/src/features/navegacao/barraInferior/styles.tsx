import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
  background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.superficie} 90%, transparent);
  backdrop-filter: blur(12px);

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    display: none;
  }

  .aba {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 0;
    font-size: 0.68rem;
    font-weight: 500;
    cursor: pointer;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
  }

  .aba.ativa {
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
  }

  .marcador {
    position: absolute;
    top: 0;
    width: 24px;
    height: 2px;
    background-color: ${({ theme }) => theme.vars.palette.cores.latao};
  }

  .centro {
    display: grid;
    place-items: center;
  }

  .mais {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    margin-top: -24px;
    border-radius: 999px;
    cursor: pointer;
    background-color: ${({ theme }) => theme.vars.palette.cores.cofre};
    color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
    box-shadow:
      0 0 0 1px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.latao} 60%, transparent),
      0 8px 24px -8px color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.cofre} 55%, transparent);
  }
` as typeof Box;
