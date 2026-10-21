import { useTheme } from '@mui/material';
import { useMediaQuery } from '@mui/material';

export const useMediaQueryHook = () => {

  const theme = useTheme();
  const ehMobile = useMediaQuery(theme.breakpoints.down('tablet'));
  return {
    ehMobile,
  };
};
