import type { ReactNode } from 'react';
import { Tipografias } from '../tipografias';
import { Container } from './styles';

interface IBloco {
  titulo?: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Bloco de conteúdo do painel. Borda fina, sem sombra. */
export const Bloco = ({ titulo, acao, children, className }: IBloco) => (
  <Container component="section" className={className}>
    {(titulo || acao) && (
      <div className="cabecalho">
        {titulo && <Tipografias.TituloBloco component="h2">{titulo}</Tipografias.TituloBloco>}
        {acao}
      </div>
    )}
    {children}
  </Container>
);
