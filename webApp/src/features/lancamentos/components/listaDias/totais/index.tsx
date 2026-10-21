import { Tipografias } from '@shared/components/tipografias';
import { formatarDinheiro } from '@utils/dinheiro';
import { Container } from './styles';

interface ITotais {
  /** Em centavos. */
  entradas: number;
  /** Em centavos. */
  saidas: number;
}

/** Barra de totais do mês, presa no rodapé (acima da barra inferior no celular). */
export const Totais = ({ entradas, saidas }: ITotais) => (
  <Container>
    <span>
      Entradas{' '}
      <Tipografias.Numero component="strong" className="entradas">
        {formatarDinheiro(entradas)}
      </Tipografias.Numero>
    </span>
    <span>
      Saídas <Tipografias.Numero component="strong">{formatarDinheiro(saidas)}</Tipografias.Numero>
    </span>
  </Container>
);
