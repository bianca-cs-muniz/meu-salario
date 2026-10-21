import type { ReactNode } from 'react';
import { Tipografias } from '../tipografias';
import { Container } from './styles';

export const Vazio = ({ texto, acao }: { texto: string; acao?: ReactNode }) => (
  <Container>
    <Tipografias.Legenda>{texto}</Tipografias.Legenda>
    {acao}
  </Container>
);
