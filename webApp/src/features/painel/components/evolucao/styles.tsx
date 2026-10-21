import { Box, styled } from '@mui/material';

export const Conteudo = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .grafico {
    width: 100%;
    height: 260px;
  }

  .legenda-customizada {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    padding-top: 4px;
  }

  .legenda-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: ${({ theme }) => theme.vars.palette.cores.tinta};
    background: ${({ theme }) => theme.vars.palette.cores.superficie2};
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.vars.palette.cores.linha};
    transition: all 0.2s ease;

    &:hover {
      background: color-mix(in srgb, ${({ theme }) => theme.vars.palette.cores.superficie2} 75%, white);
      transform: translateY(-1px);
    }
  }

  .indicador-bolinha {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .indicador-linha {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 18px;
    height: 3px;
    border-radius: 2px;

    &::after {
      content: '';
      position: absolute;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid currentColor;
    }
  }

  .legenda-resumo {
    font-size: 12.5px;
    color: ${({ theme }) => theme.vars.palette.cores.mudo};
    margin-top: -4px;
  }
`;

export const TooltipContainer = styled('div')`
  background: rgba(11, 37, 69, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45), 0 0 1px rgba(255, 255, 255, 0.2);
  min-width: 175px;

  .tooltip-titulo {
    font-size: 13px;
    font-weight: 700;
    text-transform: capitalize;
    color: #f1f5fa;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tooltip-linha {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    font-size: 12.5px;
    margin: 6px 0;
  }

  .tooltip-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #9fb3cc;
    font-weight: 500;
  }

  .tooltip-cor {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .tooltip-valor {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: #f1f5fa;
  }
`;
