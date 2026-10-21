import { useFormLancamento } from '@contexts/FormLancamentoContext';
import type { ILancamento } from '@services/tipos';
import { Bloco } from '@shared/components/bloco';
import { ItemLancamento } from '@shared/components/itemLancamento';
import { formatarDinheiro } from '@utils/dinheiro';
import { Container } from './styles';

interface IGrupoFatura {
  titulo: string;
  itens: ILancamento[];
}

/** Um grupo da fatura (fixos, parcelas ou avulsos). Some quando está vazio. */
export const GrupoFatura = ({ titulo, itens }: IGrupoFatura) => {
  const { abrirEdicao } = useFormLancamento();

  if (itens.length === 0) return null;
  const total = itens.reduce((s, l) => s + (l.tipo === 'SAIDA' ? l.valorCentavos : -l.valorCentavos), 0);

  return (
    <Container>
      <Bloco titulo={titulo} acao={<span className="total">{formatarDinheiro(total)}</span>}>
        <ul className="itens">
          {itens.map((l) => (
            <ItemLancamento key={l.id} lancamento={l} aoClicar={() => abrirEdicao(l)} />
          ))}
        </ul>
      </Bloco>
    </Container>
  );
};
