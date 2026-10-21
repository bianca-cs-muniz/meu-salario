import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  position: relative;
  overflow: hidden;
  padding: 24px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.vars.palette.cores.cofre};
  color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    padding: 32px;
  }

  .filete {
    position: absolute;
    top: 0;
    left: 24px;
    right: 24px;
    height: 1px;

    ${({ theme }) => theme.breakpoints.up('tablet')} {
      left: 32px;
      right: 32px;
    }
  }

  .conteudo {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .total {
    margin-top: 12px;
    font-size: clamp(3rem, 11vw, 4.8rem);
  }

  .datas {
    margin-top: 12px;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.vars.palette.cores.cofreMudo};
  }

  .pagar {
    border-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.latao} 60%, transparent);
    color: ${({ theme }) => theme.vars.palette.cores.cofreTinta};
  }

  .pagar:hover {
    border-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.latao} 60%, transparent);
    background-color: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.latao} 15%, transparent);
  }
` as typeof Box;
