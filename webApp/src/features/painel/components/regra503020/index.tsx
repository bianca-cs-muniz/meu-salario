import { META_GRUPO, ROTULO_GRUPO } from '@constants/rotulos';
import type { GrupoCategoria, IResumo } from '@services/tipos';
import { Bloco } from '@shared/components/bloco';
import { Tipografias } from '@shared/components/tipografias';
import { porcentagem } from '@utils/dinheiro';
import { Conteudo } from './styles';

const GRUPOS: GrupoCategoria[] = ['ESSENCIAL', 'DESEJO', 'POUPANCA'];

/** Quanto das entradas foi para essencial, desejos e guardado, contra a meta 50/30/20. */
export const Regra503020 = ({ resumo: r }: { resumo: IResumo }) => (
  <Bloco titulo="Regra 50/30/20">
    <Conteudo>
      <Tipografias.LegendaSimples className="explicacao">
        Metade para o essencial, 30% para desejos e pelo menos 20% guardado.
      </Tipografias.LegendaSimples>
      <div className="grupos">
        {GRUPOS.map((g) => {
          const pct = porcentagem(r.porGrupo[g] ?? 0, r.entradasCentavos);
          const meta = META_GRUPO[g];
          const fora = g === 'POUPANCA' ? pct < meta : pct > meta;
          return (
            <div key={g} className="grupo">
              <p className="pequeno">{ROTULO_GRUPO[g]}</p>
              <Tipografias.Valor className={fora && pct > 0 ? 'pct fora' : 'pct'}>{Math.round(pct)}%</Tipografias.Valor>
              <p className="pequeno">meta {meta}%</p>
            </div>
          );
        })}
      </div>
    </Conteudo>
  </Bloco>
);
