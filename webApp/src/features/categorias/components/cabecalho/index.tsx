import { BotaoCustomizado } from '@shared/components/botao';
import { TituloPagina } from '@shared/components/tituloPagina';
import { Container } from './styles';

export const Cabecalho = ({ aoNova }: { aoNova: () => void }) => (
  <Container>
    <TituloPagina lado={<BotaoCustomizado.BotaoPrimario onClick={aoNova}>Nova categoria</BotaoCustomizado.BotaoPrimario>}>
      Categorias
    </TituloPagina>
  </Container>
);
