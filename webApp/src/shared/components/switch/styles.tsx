import { Box, styled, Switch, Typography } from '@mui/material';

export const SwitchCustomizado = styled(Switch)`
  width: 42px;
  height: 26px;
  padding: 0;

  & .MuiSwitch-switchBase {
    padding: 0;
    margin: 2px;
    transition-duration: 300ms;
    color: ${({ theme }) => theme.vars.palette.cores.superficie};

    &.Mui-checked {
      transform: translateX(16px);
      color: ${({ theme }) => theme.vars.palette.cores.sobreDinheiro};

      & + .MuiSwitch-track {
        opacity: 1;
        border: 0;
        background-color: ${({ theme }) => theme.vars.palette.cores.dinheiro};
      }

      &.Mui-disabled + .MuiSwitch-track {
        opacity: 0.5;
      }
    }
  }

  & .MuiSwitch-thumb {
    box-sizing: border-box;
    width: 22px;
    height: 22px;
  }

  & .MuiSwitch-track {
    border-radius: 13px;
    background-color: ${({ theme }) => theme.vars.palette.cores.linha};
    opacity: 1;
    transition: background-color 500ms;
  }
`;

export const Label = styled(Typography)`
  font-size: 0.93rem;
  font-weight: 500;
  line-height: 1.5;
  color: ${({ theme }) => theme.vars.palette.cores.tinta};
`;

export const FormControlLabelCustomizado = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
`;
