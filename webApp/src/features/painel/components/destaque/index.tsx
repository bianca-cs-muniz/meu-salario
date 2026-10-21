import type { IResumo } from '@services/tipos';
import { Tipografias } from '@shared/components/tipografias';
import { competenciaAtual } from '@utils/datas';
import { formatarAbsoluto, formatarDinheiro } from '@utils/dinheiro';
import { Numero } from './numero';
import { Container, Ponto, Segmento } from './styles';

/** Painel escuro do topo: quanto ainda está livre no mês e a régua do salário por categoria. */
export const Destaque = ({ resumo: r }: { resumo: IResumo }) => {
  const negativo = r.sobraCentavos < 0;
  const base = Math.max(r.entradasCentavos, r.saidasCentavos, 1);
  const ehMesAtual = r.competencia === competenciaAtual();
  const [inteiro, centavos] = formatarAbsoluto(r.sobraCentavos).split(',');

  return (
    <Container component="section" aria-label="Resumo do mês">
      {/* fio de latão no topo, como num cartão premium */}
      <span aria-hidden className="fio" />

      <Tipografias.LegendaSimples className="rotulo">
        {negativo ? 'Acima do salário em' : 'Ainda livre este mês'}
      </Tipografias.LegendaSimples>
      <Tipografias.Valor className={negativo ? 'sobra negativo' : 'sobra'}>
        <span className="inteiro">{inteiro}</span>
        <span className="centavos">,{centavos}</span>
      </Tipografias.Valor>
      <Tipografias.LegendaSimples className="entradas">
        de{' '}
        <Tipografias.Numero component="span" className="entradasValor">
          {formatarDinheiro(r.entradasCentavos)}
        </Tipografias.Numero>{' '}
        em entradas
      </Tipografias.LegendaSimples>

      {/* A régua do salário: cada categoria ocupa sua fatia; o que sobra fica vazio. */}
      <div role="img" aria-label={`${Math.round(r.comprometidoPct)}% do salário comprometido`} className="regua">
        {r.porCategoria.map((c) => (
          <Segmento
            key={c.categoriaId}
            title={`${c.nome}: ${formatarDinheiro(c.totalCentavos)}`}
            pct={(c.totalCentavos / base) * 100}
            cor={c.cor}
          />
        ))}
      </div>
      {r.porCategoria.length > 0 && (
        <ul className="legenda">
          {r.porCategoria.slice(0, 7).map((c) => (
            <li key={c.categoriaId}>
              <Ponto cor={c.cor} />
              {c.nome}
            </li>
          ))}
        </ul>
      )}

      <dl className="numeros">
        <Numero rotulo="gasto no mês" valor={formatarDinheiro(r.saidasCentavos)} />
        <Numero rotulo="comprometido" valor={`${Math.round(r.comprometidoPct)}%`} />
        {ehMesAtual && r.podeGastarPorDiaCentavos > 0 && (
          <Numero rotulo="por dia, até o fim do mês" valor={formatarDinheiro(r.podeGastarPorDiaCentavos)} />
        )}
      </dl>
    </Container>
  );
};
