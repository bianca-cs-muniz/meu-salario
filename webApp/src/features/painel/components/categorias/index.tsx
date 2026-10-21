import type { IResumo } from '@services/tipos';
import { BarraProgresso } from '@shared/components/barraProgresso';
import { Bloco } from '@shared/components/bloco';
import { IconeCategoria } from '@shared/components/iconeCategoria';
import { Vazio } from '@shared/components/vazio';
import { formatarDinheiro, porcentagem } from '@utils/dinheiro';
import { Lista } from './styles';

/** "Para onde foi o dinheiro": gasto por categoria, contra o limite (ou contra as entradas). */
export const Categorias = ({ resumo: r }: { resumo: IResumo }) => (
  <Bloco titulo="Para onde foi o dinheiro">
    {r.porCategoria.length === 0 ? (
      <Vazio texto="Nenhum gasto neste mês ainda." />
    ) : (
      <Lista>
        {r.porCategoria.map((c) => {
          const limite = c.limiteMensalCentavos;
          const pct = limite ? porcentagem(c.totalCentavos, limite) : porcentagem(c.totalCentavos, r.entradasCentavos);
          const passou = !!limite && c.totalCentavos > limite;
          return (
            <li key={c.categoriaId}>
              <IconeCategoria nome={c.icone} cor={c.cor} />
              <div className="meio">
                <div className="linha">
                  <span className="nome">{c.nome}</span>
                  <span className={passou ? 'valor passou' : 'valor'}>
                    {formatarDinheiro(c.totalCentavos)}
                    {limite ? ` de ${formatarDinheiro(limite)}` : ''}
                  </span>
                </div>
                <BarraProgresso valor={pct} cor={c.cor} alerta={passou} />
              </div>
            </li>
          );
        })}
      </Lista>
    )}
  </Bloco>
);
