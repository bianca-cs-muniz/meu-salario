import { ErroCarregar } from '@shared/components/erroCarregar';
import { Esqueleto } from '@shared/components/esqueleto';
import { Vazio } from '@shared/components/vazio';
import { usePendenciasLista } from '../../hooks/queryes';
import { CardPendencia } from './cardPendencia';
import { Container, Itens } from './styles';

export const Lista = () => {
  const { lista, estaCarregando, erro, recarregar } = usePendenciasLista();

  if (erro) return <ErroCarregar mensagem={erro} tentar={recarregar} />;

  if (estaCarregando && !lista) {
    return (
      <Container>
        <Esqueleto altura={128} />
        <Esqueleto altura={128} />
      </Container>
    );
  }

  const itens = lista ?? [];
  if (itens.length === 0) return <Vazio texto="Nada para revisar. O estagiário está em dia." />;

  return (
    <Itens>
      {itens.map((l) => (
        <CardPendencia key={l.id} lancamento={l} />
      ))}
    </Itens>
  );
};
