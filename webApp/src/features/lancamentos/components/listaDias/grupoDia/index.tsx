import { useFormLancamento } from '@contexts/FormLancamentoContext';
import type { ILancamento } from '@services/tipos';
import { ItemLancamento } from '@shared/components/itemLancamento';
import { Tipografias } from '@shared/components/tipografias';
import { formatarDinheiro } from '@utils/dinheiro';
import { rotuloDia } from '@utils/datas';
import { Container } from './styles';

interface IGrupoDia {
  itens: ILancamento[];
  /** Soma das saídas do dia, em centavos. */
  saidas: number;
}

export const GrupoDia = ({ itens, saidas }: IGrupoDia) => {
  const { abrirEdicao } = useFormLancamento();

  return (
    <Container component="section">
      <header className="cabecalho">
        <Tipografias.TextoForte component="h2" className="dia">
          {rotuloDia(itens[0].data)}
        </Tipografias.TextoForte>
        {saidas > 0 && (
          <Tipografias.LegendaSimples component="span" className="saidas">
            − {formatarDinheiro(saidas)}
          </Tipografias.LegendaSimples>
        )}
      </header>
      <ul className="itens">
        {itens.map((l) => (
          <ItemLancamento key={l.id} lancamento={l} aoClicar={() => abrirEdicao(l)} />
        ))}
      </ul>
    </Container>
  );
};
