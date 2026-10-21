import { BotaoCustomizado } from '../botao';
import { Tipografias } from '../tipografias';
import { Container } from './styles';

interface IErroCarregar {
  mensagem: string;
  tentar: () => void;
}

export const ErroCarregar = ({ mensagem, tentar }: IErroCarregar) => (
  <Container>
    <Tipografias.TextoSimples className="mensagem">{mensagem}</Tipografias.TextoSimples>
    <BotaoCustomizado.BotaoSecundario onClick={tentar}>Tentar de novo</BotaoCustomizado.BotaoSecundario>
  </Container>
);
