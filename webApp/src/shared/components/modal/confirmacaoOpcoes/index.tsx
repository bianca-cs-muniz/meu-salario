import type { FC } from 'react';
import { ModalCustomizado } from '..';
import { Tipografias } from '../../tipografias';
import { Container, Opcoes } from './styles';

export interface IOpcaoConfirmacao {
  texto: string;
  perigo?: boolean;
  acao: () => void;
}

interface IConfirmacaoOpcoes {
  open: boolean;
  titulo: string;
  texto: string;
  opcoes: IOpcaoConfirmacao[];
  onClose: () => void;
}

/** Pergunta com mais de uma saída (ex.: "Só nesta" / "Nesta e nas próximas") + Cancelar. */
export const ConfirmacaoOpcoes: FC<IConfirmacaoOpcoes> = ({ open, titulo, texto, opcoes, onClose }) => {
  return (
    <ModalCustomizado open={open} onClose={onClose} title={titulo} largura="estreita">
      <Container>
        <Tipografias.Legenda className="texto">{texto}</Tipografias.Legenda>
        <Opcoes>
          {opcoes.map((o) => (
            <button key={o.texto} type="button" className={o.perigo ? 'opcao perigo' : 'opcao'} onClick={o.acao}>
              {o.texto}
            </button>
          ))}
          <button type="button" className="cancelar" onClick={onClose}>
            Cancelar
          </button>
        </Opcoes>
      </Container>
    </ModalCustomizado>
  );
};
