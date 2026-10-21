import { Esqueleto } from '@shared/components/esqueleto';
import { Container } from './styles';

/** Esqueleto do painel enquanto o resumo do mês carrega. */
export const PainelCarregando = () => (
  <Container>
    <Esqueleto altura={40} largura={256} />
    <div className="destaque">
      <Esqueleto altura={288} />
    </div>
    <div className="colunas">
      <Esqueleto altura={256} />
      <Esqueleto altura={256} />
    </div>
  </Container>
);
