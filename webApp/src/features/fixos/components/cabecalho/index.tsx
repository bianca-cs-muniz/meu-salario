import { BotaoCustomizado } from '@shared/components/botao';
import { Tipografias } from '@shared/components/tipografias';
import { TituloPagina } from '@shared/components/tituloPagina';
import { Container } from './styles';

export const Cabecalho = ({ aoNovo }: { aoNovo: () => void }) => (
  <Container>
    <TituloPagina lado={<BotaoCustomizado.BotaoPrimario onClick={aoNovo}>Novo fixo</BotaoCustomizado.BotaoPrimario>}>
      Gastos fixos
    </TituloPagina>
    <Tipografias.Legenda className="legenda">
      Entram sozinhos todo mês. Mudar o valor aqui vale para os próximos meses.
    </Tipografias.Legenda>
  </Container>
);
