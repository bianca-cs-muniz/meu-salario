import { BotaoCustomizado } from '@shared/components/botao';
import { Tipografias } from '@shared/components/tipografias';
import { Container } from './styles';

/** Tem token, mas a API não respondeu. Não desloga: mostra o aviso e deixa tentar de novo. */
export const SemConexao = ({ tentarDeNovo }: { tentarDeNovo: () => void }) => (
  <Container component="main">
    <div className="conteudo">
      <Tipografias.TituloBloco component="h1" className="titulo">
        Sem conexão com o servidor
      </Tipografias.TituloBloco>
      <Tipografias.Legenda className="texto">
        Seus dados estão salvos. Verifique a internet ou se a API está rodando e tente de novo.
      </Tipografias.Legenda>
      <BotaoCustomizado.BotaoPrimario onClick={tentarDeNovo}>Tentar de novo</BotaoCustomizado.BotaoPrimario>
    </div>
  </Container>
);
