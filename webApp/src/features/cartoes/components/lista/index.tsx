import type { ICartao } from '@services/tipos';
import { BotaoCustomizado } from '@shared/components/botao';
import { ErroCarregar } from '@shared/components/erroCarregar';
import { Esqueleto } from '@shared/components/esqueleto';
import { Vazio } from '@shared/components/vazio';
import { useCartoesLista } from '../../hooks/queryes';
import { CardCartao } from './cardCartao';
import { Grade, Itens } from './styles';

interface ILista {
  aoNovo: () => void;
  aoEditar: (cartao: ICartao) => void;
}

export const Lista = ({ aoNovo, aoEditar }: ILista) => {
  const { lista, estaCarregando, erro, recarregar } = useCartoesLista();

  if (erro) return <ErroCarregar mensagem={erro} tentar={recarregar} />;

  if (estaCarregando && !lista) {
    return (
      <Grade>
        <Esqueleto altura={176} />
        <Esqueleto altura={176} />
      </Grade>
    );
  }

  const cartoes = (lista ?? []).filter((c) => c.ativo);
  if (cartoes.length === 0) {
    return (
      <Vazio
        texto="Nenhum cartão cadastrado. Cadastre para o app saber em qual fatura cada compra cai."
        acao={<BotaoCustomizado.BotaoPrimario onClick={aoNovo}>Cadastrar cartão</BotaoCustomizado.BotaoPrimario>}
      />
    );
  }

  return (
    <Itens>
      {cartoes.map((c) => (
        <CardCartao key={c.id} cartao={c} aoEditar={() => aoEditar(c)} />
      ))}
    </Itens>
  );
};
