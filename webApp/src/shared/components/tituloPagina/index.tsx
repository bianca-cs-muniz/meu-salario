import type { ReactNode } from 'react';
import { Tipografias } from '../tipografias';
import { Container } from './styles';

interface ITituloPagina {
  children: ReactNode;
  lado?: ReactNode;
}

export const TituloPagina = ({ children, lado }: ITituloPagina) => (
  <Container>
    <Tipografias.Titulo component="h1">{children}</Tipografias.Titulo>
    {lado}
  </Container>
);
