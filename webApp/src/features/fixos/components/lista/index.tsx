import type { IRecorrencia, TipoLancamento } from '@services/tipos';
import { ErroCarregar } from '@shared/components/erroCarregar';
import { Esqueleto } from '@shared/components/esqueleto';
import { useFixosLista } from '../../hooks/queryes';
import { GrupoFixos } from './grupoFixos';
import { Container, Secoes } from './styles';

interface ILista {
  aoAbrir: (alvo: IRecorrencia | TipoLancamento) => void;
}

export const Lista = ({ aoAbrir }: ILista) => {
  const { lista, estaCarregando, erro, recarregar } = useFixosLista();

  if (erro) return <ErroCarregar mensagem={erro} tentar={recarregar} />;

  if (estaCarregando && !lista) {
    return (
      <Container>
        <Esqueleto altura={128} />
        <Esqueleto altura={192} />
      </Container>
    );
  }

  const ativos = (lista ?? []).filter((r) => r.ativa);
  const secoes = [
    { titulo: 'Entradas fixas', itens: ativos.filter((r) => r.tipo === 'ENTRADA'), entrada: true },
    { titulo: 'Fixos da casa', itens: ativos.filter((r) => r.tipo === 'SAIDA' && r.formaPagamento !== 'CREDITO'), entrada: false },
    { titulo: 'Fixos no cartão', itens: ativos.filter((r) => r.tipo === 'SAIDA' && r.formaPagamento === 'CREDITO'), entrada: false },
  ];

  return (
    <Secoes>
      {secoes.map((s) => (
        <GrupoFixos key={s.titulo} titulo={s.titulo} itens={s.itens} entrada={s.entrada} aoAbrir={aoAbrir} />
      ))}
    </Secoes>
  );
};
