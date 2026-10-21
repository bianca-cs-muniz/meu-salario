import type { FormaPagamento as TFormaPagamento, ICarteira } from '@services/tipos';
import { ROTULO_FORMA } from '@constants/rotulos';
import { Chips } from '@shared/components/chips';
import { formatarDinheiro } from '@utils/dinheiro';
import { Container } from './styles';

interface IFormaPagamento {
  formas: TFormaPagamento[];
  forma: TFormaPagamento;
  aoMudar: (f: TFormaPagamento) => void;
  carteiraVr?: ICarteira;
}

export const FormaPagamento = ({ formas, forma, aoMudar, carteiraVr }: IFormaPagamento) => (
  <Container>
    <legend>Forma de pagamento</legend>
    <Chips
      rotulo="Forma de pagamento"
      opcoes={formas.map((f) => ({ valor: f, texto: ROTULO_FORMA[f] }))}
      valor={forma}
      aoMudar={aoMudar}
    />
    {forma === 'VR' && carteiraVr && (
      <p className="saldo">
        Saldo do VR: <strong>{formatarDinheiro(carteiraVr.saldoCentavos)}</strong>
      </p>
    )}
  </Container>
);
