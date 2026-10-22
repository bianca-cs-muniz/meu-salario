import { MessageCircle, Repeat, Send } from 'lucide-react';
import type { ILancamento } from '@services/tipos';
import { ROTULO_FORMA } from '@constants/rotulos';
import { formatarDinheiro } from '@utils/dinheiro';
import { IconeCategoria } from '../iconeCategoria';
import { COR_ENTRADA } from '../iconeCategoria/icones';
import { Tipografias } from '../tipografias';
import { Item } from './styles';

interface IItemLancamento {
  lancamento: ILancamento;
  aoClicar?: () => void;
}

export const ItemLancamento = ({ lancamento: l, aoClicar }: IItemLancamento) => {
  const entrada = l.tipo === 'ENTRADA';
  const detalhes = [
    entrada ? 'Entrada' : l.categoria?.nome,
    l.cartao ? l.cartao.nome : ROTULO_FORMA[l.formaPagamento],
    l.parcelaTotal && !l.descricao.includes(`(${l.parcelaNumero}/${l.parcelaTotal})`) ? `${l.parcelaNumero}/${l.parcelaTotal}` : null,
  ].filter(Boolean);

  return (
    <Item>
      <button type="button" onClick={aoClicar} className="botao">
        {entrada ? (
          <IconeCategoria nome="wallet" cor={COR_ENTRADA} />
        ) : (
          <IconeCategoria nome={l.categoria?.icone} cor={l.categoria?.cor} />
        )}
        <span className="meio">
          <span className="linha">
            <span className="descricao">{l.descricao}</span>
            {l.origem === 'WHATSAPP' && <MessageCircle size={14} className="whatsapp" aria-label="Anotado pelo WhatsApp" />}
            {l.origem === 'TELEGRAM' && <Send size={14} className="telegram" aria-label="Anotado pelo Telegram" />}
            {l.origem === 'RECORRENCIA' && <Repeat size={13} className="fixo" aria-label="Gasto fixo" />}
          </span>
          <span className="detalhes">
            <span className="texto">{detalhes.join(' · ')}</span>
            {!l.revisado && <span className="revisar">Revisar</span>}
          </span>
        </span>
        <Tipografias.Valor component="span" className={entrada ? 'valor entrada' : 'valor'}>
          {entrada ? '+ ' : '− '}
          {formatarDinheiro(l.valorCentavos)}
        </Tipografias.Valor>
      </button>
    </Item>
  );
};
