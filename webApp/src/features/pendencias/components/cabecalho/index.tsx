import { BotaoCustomizado } from '@shared/components/botao';
import { Tipografias } from '@shared/components/tipografias';
import { TituloPagina } from '@shared/components/tituloPagina';
import { usePendenciasLista, usePendenciasMutacoes } from '../../hooks/queryes';
import { Container } from './styles';

export const Cabecalho = () => {
  const { lista = [] } = usePendenciasLista();
  const { aprovar, estaAprovando } = usePendenciasMutacoes();

  return (
    <Container>
      <TituloPagina
        lado={
          lista.length > 1 && (
            <BotaoCustomizado.BotaoSecundario carregando={estaAprovando} onClick={() => aprovar(lista.map((l) => l.id))}>
              Aprovar todos
            </BotaoCustomizado.BotaoSecundario>
          )
        }
      >
        Pendências
      </TituloPagina>
      <Tipografias.Legenda className="legenda">
        O que o estagiário anotou pelo WhatsApp e deixou para você conferir.
      </Tipografias.Legenda>
    </Container>
  );
};
