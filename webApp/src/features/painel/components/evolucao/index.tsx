import { alpha, useTheme, type Theme } from '@mui/material';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bloco } from '@shared/components/bloco';
import { Tipografias } from '@shared/components/tipografias';
import { nomeMesCurto } from '@utils/datas';
import { useEvolucao } from '../../hooks/queryes';
import { Conteudo, TooltipContainer } from './styles';

const moeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

type CoresTema = Theme['palette']['cores'];

/** Cores fortes do gráfico, vindas do tema (tokens `grafico*`); o recharts precisa do valor real. */
const coresGrafico = (cores: CoresTema) => ({
  entradas: {
    inicio: cores.graficoEntrada,
    fim: cores.graficoEntradaFim,
    solida: cores.graficoEntrada,
    rotulo: 'Entradas',
  },
  saidas: {
    inicio: cores.graficoSaida,
    fim: cores.graficoSaidaFim,
    solida: cores.graficoSaida,
    rotulo: 'Saídas',
  },
  sobra: {
    inicio: cores.graficoSobraInicio,
    fim: cores.graficoSobra,
    solida: cores.graficoSobra,
    rotulo: 'Sobra do mês',
  },
});

interface TooltipPayloadItem {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  const { cores } = useTheme().palette;
  if (!active || !payload || !payload.length) return null;
  const CORES_GRAFICO = coresGrafico(cores);

  return (
    <TooltipContainer>
      <div className="tooltip-titulo">{label}</div>
      {payload.map((item) => {
        let cor = cores.cofreMudo;
        let rotulo = item.name;

        if (item.name === 'Entradas') {
          cor = CORES_GRAFICO.entradas.solida;
          rotulo = CORES_GRAFICO.entradas.rotulo;
        } else if (item.name === 'Saídas') {
          cor = CORES_GRAFICO.saidas.solida;
          rotulo = CORES_GRAFICO.saidas.rotulo;
        } else if (item.name === 'Sobra') {
          cor = CORES_GRAFICO.sobra.solida;
          rotulo = CORES_GRAFICO.sobra.rotulo;
        }

        const ehSobra = item.name === 'Sobra';
        const corValor = ehSobra && item.value < 0 ? cores.cofreAlerta : cores.tooltipTinta;

        return (
          <div key={item.name} className="tooltip-linha">
            <span className="tooltip-label">
              <span className="tooltip-cor" style={{ backgroundColor: cor }} />
              {rotulo}
            </span>
            <span className="tooltip-valor" style={{ color: corValor }}>
              {moeda(item.value)}
            </span>
          </div>
        );
      })}
    </TooltipContainer>
  );
};

/** Gráfico dos últimos 6 meses: barras de entradas/saídas e linha da sobra. */
export const Evolucao = () => {
  const { cores } = useTheme().palette;
  const { evolucao } = useEvolucao(6);
  const CORES_GRAFICO = coresGrafico(cores);

  if (!evolucao || evolucao.length < 2) return null;

  const pontos = evolucao.map((m) => ({
    mes: nomeMesCurto(m.competencia),
    Entradas: m.entradasCentavos / 100,
    Saídas: m.saidasCentavos / 100,
    Sobra: m.sobraCentavos / 100,
  }));

  return (
    <Bloco titulo="Últimos 6 meses">
      <Conteudo>
        <div className="grafico">
          <ResponsiveContainer>
            <ComposedChart data={pontos} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
              <defs>
                {/* Gradiente Entradas (Verde Esmeralda Vibrante) */}
                <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CORES_GRAFICO.entradas.inicio} stopOpacity={1} />
                  <stop offset="100%" stopColor={CORES_GRAFICO.entradas.fim} stopOpacity={0.85} />
                </linearGradient>

                {/* Gradiente Saídas (Coral / Vermelho Framboesa Vibrante) */}
                <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CORES_GRAFICO.saidas.inicio} stopOpacity={1} />
                  <stop offset="100%" stopColor={CORES_GRAFICO.saidas.fim} stopOpacity={0.85} />
                </linearGradient>

                {/* Gradiente Linha da Sobra (Dourado / Âmbar Radiante) */}
                <linearGradient id="gradSobra" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={CORES_GRAFICO.sobra.inicio} />
                  <stop offset="100%" stopColor={CORES_GRAFICO.sobra.fim} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke={cores.linha} strokeDasharray="4 4" />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: cores.mudo, fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={72}
                tick={{ fill: cores.mudo, fontSize: 12 }}
                tickFormatter={moeda}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: alpha(cores.tinta, 0.04), radius: 4 }}
              />
              <Bar
                dataKey="Entradas"
                fill="url(#gradEntradas)"
                radius={[6, 6, 0, 0]}
                maxBarSize={22}
              />
              <Bar
                dataKey="Saídas"
                fill="url(#gradSaidas)"
                radius={[6, 6, 0, 0]}
                maxBarSize={22}
              />
              <Line
                type="monotone"
                dataKey="Sobra"
                stroke="url(#gradSobra)"
                strokeWidth={3}
                dot={{ r: 4, fill: cores.superficie, stroke: CORES_GRAFICO.sobra.solida, strokeWidth: 2.5 }}
                activeDot={{ r: 6, fill: CORES_GRAFICO.sobra.inicio, stroke: cores.superficie, strokeWidth: 2.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="legenda-customizada">
          <div className="legenda-item">
            <span
              className="indicador-bolinha"
              style={{
                backgroundColor: CORES_GRAFICO.entradas.solida,
                boxShadow: `0 0 8px ${alpha(CORES_GRAFICO.entradas.solida, 0.6)}`,
              }}
            />
            <span>Entradas</span>
          </div>
          <div className="legenda-item">
            <span
              className="indicador-bolinha"
              style={{
                backgroundColor: CORES_GRAFICO.saidas.solida,
                boxShadow: `0 0 8px ${alpha(CORES_GRAFICO.saidas.solida, 0.6)}`,
              }}
            />
            <span>Saídas</span>
          </div>
          <div className="legenda-item">
            <span
              className="indicador-linha"
              style={{
                color: CORES_GRAFICO.sobra.solida,
                backgroundColor: CORES_GRAFICO.sobra.solida,
                boxShadow: `0 0 8px ${alpha(CORES_GRAFICO.sobra.solida, 0.6)}`,
              }}
            />
            <span>Sobra</span>
          </div>
        </div>

        <Tipografias.LegendaSimples className="legenda-resumo">
          Barras: entradas e saídas. Linha: quanto sobrou em cada mês.
        </Tipografias.LegendaSimples>
      </Conteudo>
    </Bloco>
  );
};
