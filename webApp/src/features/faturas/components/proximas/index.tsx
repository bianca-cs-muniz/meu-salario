import type { IFaturaDetalhe } from '@services/tipos';
import { Bloco } from '@shared/components/bloco';
import { Tipografias } from '@shared/components/tipografias';
import { formatarDinheiro } from '@utils/dinheiro';
import { capitalizar, nomeMesSemAno } from '@utils/datas';
import { Container } from './styles';

interface IProximas {
  proximas: IFaturaDetalhe['proximas'];
  aoEscolher: (competencia: string) => void;
}

/** Próximas faturas já comprometidas. Some quando todas estão zeradas. */
export const Proximas = ({ proximas, aoEscolher }: IProximas) => {
  if (!proximas.some((p) => p.totalCentavos > 0)) return null;

  return (
    <Container>
      <Bloco titulo="Próximas faturas">
        <Tipografias.LegendaSimples className="legenda">Já comprometido com parcelas e fixos.</Tipografias.LegendaSimples>
        <ul className="lista">
          {proximas.map((p) => (
            <li key={p.competencia}>
              <button type="button" onClick={() => aoEscolher(p.competencia)} className="botao">
                <span>{capitalizar(nomeMesSemAno(p.competencia))}</span>
                <span className="valor">{formatarDinheiro(p.totalCentavos)}</span>
              </button>
            </li>
          ))}
        </ul>
      </Bloco>
    </Container>
  );
};
