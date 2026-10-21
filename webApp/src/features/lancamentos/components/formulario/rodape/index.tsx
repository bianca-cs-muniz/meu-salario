import type { TipoLancamento } from '@services/tipos';
import { BotaoCustomizado } from '@shared/components/botao';
import { Container } from './styles';

interface IRodape {
  editando: boolean;
  tipo: TipoLancamento;
  salvando: boolean;
  aoExcluir: () => void;
}

export const Rodape = ({ editando, tipo, salvando, aoExcluir }: IRodape) => (
  <Container>
    {editando ? (
      <BotaoCustomizado.BotaoFantasma perigo onClick={aoExcluir}>
        Excluir
      </BotaoCustomizado.BotaoFantasma>
    ) : (
      <span />
    )}
    <BotaoCustomizado.BotaoPrimario type="submit" carregando={salvando}>
      {editando ? 'Salvar alterações' : tipo === 'SAIDA' ? 'Adicionar gasto' : 'Adicionar entrada'}
    </BotaoCustomizado.BotaoPrimario>
  </Container>
);
