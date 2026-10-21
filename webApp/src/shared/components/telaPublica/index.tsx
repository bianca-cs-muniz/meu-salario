import type { ReactNode } from 'react';
import { Tipografias } from '../tipografias';
import { Container } from './styles';

interface ITelaPublica {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
}

/** Moldura das telas sem login (Entrar / Criar conta). */
export const TelaPublica = ({ titulo, subtitulo, children }: ITelaPublica) => (
  <Container component="main">
    <div className="conteudo">
      <Tipografias.Marca className="marca">
        Meu Salário
        <span className="traco" />
      </Tipografias.Marca>
      <Tipografias.TituloTela component="h1">{titulo}</Tipografias.TituloTela>
      <Tipografias.Legenda className="subtitulo">{subtitulo}</Tipografias.Legenda>
      {children}
    </div>
  </Container>
);
