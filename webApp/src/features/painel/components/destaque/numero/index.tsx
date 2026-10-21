import { Container } from './styles';

/** Número do rodapé do destaque (rótulo embaixo, valor em cima). */
export const Numero = ({ rotulo, valor }: { rotulo: string; valor: string }) => (
  <Container>
    <dt className="rotulo">{rotulo}</dt>
    <dd className="valor">{valor}</dd>
  </Container>
);
