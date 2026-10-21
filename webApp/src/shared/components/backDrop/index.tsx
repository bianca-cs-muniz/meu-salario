import { type FC } from 'react';
import { CircularProgress } from '@mui/material';
import { Fundo } from './styles';

export const BackDropCustomizado: FC<{ aberto: boolean }> = ({ aberto }) => {
  return (
    <Fundo open={aberto}>
      <CircularProgress color="inherit" />
    </Fundo>
  );
};
