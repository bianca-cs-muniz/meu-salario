import type { IFaturaDetalhe } from '@services/tipos';
import { BotaoCustomizado } from '@shared/components/botao';
import { Tipografias } from '@shared/components/tipografias';
import { formatarDinheiro } from '@utils/dinheiro';
import { dataCurta } from '@utils/datas';
import { ChipStatusFatura } from '@features/cartoes/components/chipStatusFatura';
import { useFaturasMutacoes } from '../../hooks/queryes';
import { Container } from './styles';

/** Total da fatura, datas, status e o botão de pagar/desfazer. */
export const Destaque = ({ fatura: f }: { fatura: IFaturaDetalhe }) => {
  const { alternarPagamento, estaPagando } = useFaturasMutacoes();

  return (
    <Container component="section">
      {/* Filete na cor do cartão (dado do banco). */}
      <span aria-hidden className="filete" style={{ background: f.cartao.cor }} />
      <div className="conteudo">
        <div>
          <ChipStatusFatura status={f.status} sobreCofre />
          <Tipografias.Valor component="p" className="total">
            {formatarDinheiro(f.totalCentavos)}
          </Tipografias.Valor>
          <p className="datas">
            Fecha {dataCurta(f.fechamento)} · vence {dataCurta(f.vencimento)}
            {f.pagaEm && ` · paga em ${dataCurta(f.pagaEm)}`}
          </p>
        </div>
        {f.id && f.status !== 'ABERTA' && (
          <BotaoCustomizado.BotaoSecundario className="pagar" carregando={estaPagando} onClick={() => alternarPagamento(f)}>
            {f.pagaEm ? 'Desfazer pagamento' : 'Marcar como paga'}
          </BotaoCustomizado.BotaoSecundario>
        )}
      </div>
    </Container>
  );
};
