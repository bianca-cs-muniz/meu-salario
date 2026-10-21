import { MessageCircle } from 'lucide-react';
import { useConfirm } from 'material-ui-confirm';
import { useFormLancamento } from '@contexts/FormLancamentoContext';
import { ROTULO_FORMA } from '@constants/rotulos';
import type { ILancamento } from '@services/tipos';
import { BotaoCustomizado } from '@shared/components/botao';
import { IconeCategoria } from '@shared/components/iconeCategoria';
import { Tipografias } from '@shared/components/tipografias';
import { formatarDinheiro } from '@utils/dinheiro';
import { rotuloDia } from '@utils/datas';
import { usePendenciasMutacoes } from '../../../hooks/queryes';
import { Card } from './styles';

export const CardPendencia = ({ lancamento: l }: { lancamento: ILancamento }) => {
  const { abrirEdicao } = useFormLancamento();
  const { aprovar, estaAprovando, excluir } = usePendenciasMutacoes();
  const confirmar = useConfirm();

  const handleExcluir = async () => {
    const { confirmed } = await confirmar({
      title: 'Excluir lançamento',
      description: `Excluir “${l.descricao}”${l.grupoParcelaId ? ' e todas as parcelas seguintes' : ''}?`,
      confirmationText: 'Excluir',
      cancellationText: 'Cancelar',
    });
    if (confirmed) await excluir(l);
  };

  const detalhes = [l.categoria?.nome, l.cartao?.nome ?? ROTULO_FORMA[l.formaPagamento], rotuloDia(l.data)]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card>
      <div className="topo">
        <IconeCategoria nome={l.categoria?.icone} cor={l.categoria?.cor} />
        <div className="meio">
          <div className="linha">
            <Tipografias.TextoForte className="descricao">{l.descricao}</Tipografias.TextoForte>
            <Tipografias.TextoForte className={l.tipo === 'ENTRADA' ? 'valor entrada' : 'valor'}>{formatarDinheiro(l.valorCentavos)}</Tipografias.TextoForte>
          </div>
          <Tipografias.LegendaSimples>{detalhes}</Tipografias.LegendaSimples>
          {l.observacao && (
            <Tipografias.TextoSimples className="observacao">
              <MessageCircle size={16} />
              {l.observacao}
            </Tipografias.TextoSimples>
          )}
        </div>
      </div>
      <div className="acoes">
        <BotaoCustomizado.BotaoGrupo alinhamento="fim">
          <BotaoCustomizado.BotaoFantasma perigo onClick={handleExcluir}>
            Excluir
          </BotaoCustomizado.BotaoFantasma>
          <BotaoCustomizado.BotaoSecundario onClick={() => abrirEdicao(l)}>Corrigir</BotaoCustomizado.BotaoSecundario>
          <BotaoCustomizado.BotaoPrimario onClick={() => aprovar([l.id])} disabled={estaAprovando}>
            Aprovar
          </BotaoCustomizado.BotaoPrimario>
        </BotaoCustomizado.BotaoGrupo>
      </div>
    </Card>
  );
};
