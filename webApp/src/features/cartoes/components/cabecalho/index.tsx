import { BotaoCustomizado } from '@shared/components/botao';
import { TituloPagina } from '@shared/components/tituloPagina';
import { Container } from './styles';

export const Cabecalho = ({ aoNovo }: { aoNovo: () => void }) => (
  <Container>
    <TituloPagina lado={<BotaoCustomizado.BotaoPrimario onClick={aoNovo}>Novo cartão</BotaoCustomizado.BotaoPrimario>}>
      Cartões
    </TituloPagina>
  </Container>
);
