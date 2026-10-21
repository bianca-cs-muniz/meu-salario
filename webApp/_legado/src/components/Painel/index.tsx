"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "@/contexts/app";
import { useCompetencia } from "@/hooks/useCompetencia";
import { useDados } from "@/hooks/useDados";
import ResumoService from "@/services/resumo/resumo.service";
import LancamentosService from "@/services/lancamentos/lancamentos.service";
import { GrupoCategoria, IResumo } from "@/services/tipos";
import { Bloco, BarraProgresso, ErroCarregar, Esqueleto, Vazio, Botao } from "@/shared/components/ui";
import { SeletorMes } from "@/shared/components/SeletorMes";
import { IconeCategoria } from "@/shared/components/Icone";
import { ItemLancamento } from "@/shared/components/ItemLancamento";
import { CLASSE_STATUS_FATURA, META_GRUPO, ROTULO_GRUPO, ROTULO_STATUS_FATURA } from "@/shared/components/rotulos";
import { formatarAbsoluto, formatarDinheiro, porcentagem } from "@/utils/dinheiro";
import { competenciaAtual, dataCurta, nomeMesCurto, nomeMesSemAno } from "@/utils/datas";
import { Onboarding } from "@/components/Onboarding";

export function Painel() {
  const { competencia } = useCompetencia();
  const resumo = useDados(() => ResumoService.doMes(competencia), [competencia]);

  if (resumo.erro) return <ErroCarregar mensagem={resumo.erro} tentar={resumo.recarregar} />;
  if (!resumo.dados) return <PainelCarregando />;
  if (!resumo.dados.temEntradaFixa) return <Onboarding />;

  const r = resumo.dados;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SeletorMes />
      </div>

      <Destaque r={r} />

      {r.pendencias > 0 && (
        <Link
          href="/pendencias"
          className="flex items-center gap-3 rounded-xl border border-linha border-l-2 border-l-latao bg-superficie px-4 py-3.5"
        >
          <Inbox size={19} strokeWidth={1.6} className="shrink-0 text-latao" />
          <span className="font-medium">
            O estagiário deixou {r.pendencias} {r.pendencias === 1 ? "lançamento" : "lançamentos"} para você revisar
          </span>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Categorias r={r} />
          <UltimosLancamentos />
        </div>
        <div className="flex flex-col gap-6">
          {r.faturas.length > 0 && <Faturas r={r} />}
          {r.vr && <BlocoVr vr={r.vr} />}
          <Regra503020 r={r} />
        </div>
      </div>

      <Evolucao />
    </div>
  );
}

function Destaque({ r }: { r: IResumo }) {
  const negativo = r.sobraCentavos < 0;
  const base = Math.max(r.entradasCentavos, r.saidasCentavos, 1);
  const ehMesAtual = r.competencia === competenciaAtual();
  const [inteiro, centavos] = formatarAbsoluto(r.sobraCentavos).split(",");

  return (
    <section
      aria-label="Resumo do mês"
      className="relative overflow-hidden rounded-2xl bg-cofre px-6 pb-6 pt-7 text-cofre-tinta md:px-9 md:pb-8 md:pt-9"
    >
      {/* fio de latão no topo, como num cartão premium */}
      <span aria-hidden className="absolute inset-x-6 top-0 h-px bg-latao/70 md:inset-x-9" />

      <p className="text-[0.82rem] font-medium tracking-[0.04em] text-cofre-mudo">
        {negativo ? "Acima do salário em" : "Ainda livre este mês"}
      </p>
      <p className={`num mt-2 font-display leading-[0.9] ${negativo ? "text-[#ffd0dc]" : ""}`}>
        <span className="text-[clamp(3.6rem,16vw,6.2rem)]">{inteiro}</span>
        <span className="text-[clamp(1.6rem,5vw,2.6rem)] text-cofre-mudo">,{centavos}</span>
      </p>
      <p className="mt-3 text-sm text-cofre-mudo">
        de <span className="num font-semibold text-cofre-tinta">{formatarDinheiro(r.entradasCentavos)}</span> em entradas
      </p>

      {/* A régua do salário: cada categoria ocupa sua fatia; o que sobra fica vazio. */}
      <div
        role="img"
        aria-label={`${Math.round(r.comprometidoPct)}% do salário comprometido`}
        className="mt-7 flex h-2 overflow-hidden rounded-full bg-white/10"
      >
        {r.porCategoria.map((c) => (
          <span
            key={c.categoriaId}
            title={`${c.nome}: ${formatarDinheiro(c.totalCentavos)}`}
            className="h-full border-r border-cofre last:border-r-0 transition-[flex-basis] duration-500"
            style={{ flex: `0 0 ${(c.totalCentavos / base) * 100}%`, background: c.cor }}
          />
        ))}
      </div>
      {r.porCategoria.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.8rem] text-cofre-mudo">
          {r.porCategoria.slice(0, 7).map((c) => (
            <li key={c.categoriaId} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.cor }} />
              {c.nome}
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-3">
        <Numero rotulo="gasto no mês" valor={formatarDinheiro(r.saidasCentavos)} />
        <Numero rotulo="comprometido" valor={`${Math.round(r.comprometidoPct)}%`} />
        {ehMesAtual && r.podeGastarPorDiaCentavos > 0 && (
          <Numero rotulo={`por dia, até o fim do mês`} valor={formatarDinheiro(r.podeGastarPorDiaCentavos)} />
        )}
      </dl>
    </section>
  );
}

function Numero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="text-[0.8rem] text-cofre-mudo">{rotulo}</dt>
      <dd className="num font-display text-[1.5rem] leading-none md:text-[1.75rem]">{valor}</dd>
    </div>
  );
}

function Categorias({ r }: { r: IResumo }) {
  return (
    <Bloco titulo="Para onde foi o dinheiro">
      {r.porCategoria.length === 0 ? (
        <Vazio texto="Nenhum gasto neste mês ainda." />
      ) : (
        <ul className="flex flex-col gap-4">
          {r.porCategoria.map((c) => {
            const limite = c.limiteMensalCentavos;
            const pct = limite ? porcentagem(c.totalCentavos, limite) : porcentagem(c.totalCentavos, r.entradasCentavos);
            const passou = !!limite && c.totalCentavos > limite;
            return (
              <li key={c.categoriaId} className="flex items-center gap-3">
                <IconeCategoria nome={c.icone} cor={c.cor} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold">{c.nome}</span>
                    <span className={`num shrink-0 text-sm ${passou ? "font-semibold text-alerta" : "text-mudo"}`}>
                      {formatarDinheiro(c.totalCentavos)}
                      {limite ? ` de ${formatarDinheiro(limite)}` : ""}
                    </span>
                  </div>
                  <BarraProgresso valor={pct} cor={c.cor} alerta={passou} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Bloco>
  );
}

function Faturas({ r }: { r: IResumo }) {
  return (
    <Bloco titulo={`Faturas de ${nomeMesSemAno(r.competencia)}`}>
      <ul className="flex flex-col gap-2">
        {r.faturas.map((f) => (
          <li key={`${f.cartaoId}-${f.competencia}`}>
            <Link
              href={`/cartoes/${f.cartaoId}?competencia=${f.competencia}`}
              className="flex items-center gap-3 rounded-lg px-1 py-2.5 hover:bg-papel/60"
            >
              <span className="h-9 w-[3px] rounded-full" style={{ background: f.cartao.cor }} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{f.cartao.nome}</span>
                <span className="text-sm text-mudo">Vence {dataCurta(f.vencimento)}</span>
              </span>
              <span className="text-right">
                <span className="num block font-display text-xl leading-tight">{formatarDinheiro(f.totalCentavos)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CLASSE_STATUS_FATURA[f.status]}`}>
                  {ROTULO_STATUS_FATURA[f.status]}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Bloco>
  );
}

function BlocoVr({ vr }: { vr: NonNullable<IResumo["vr"]> }) {
  return (
    <Bloco titulo="VR">
      <p className="num font-display text-[2.6rem] leading-none">{formatarDinheiro(vr.saldoCentavos)}</p>
      <p className="text-sm text-mudo">de saldo disponível</p>
      <div className="mt-3 flex gap-6 text-sm">
        <span>
          <span className="text-mudo">Entrou </span>
          <span className="num font-semibold text-dinheiro">{formatarDinheiro(vr.entradasMesCentavos)}</span>
        </span>
        <span>
          <span className="text-mudo">Saiu </span>
          <span className="num font-semibold">{formatarDinheiro(vr.saidasMesCentavos)}</span>
        </span>
      </div>
    </Bloco>
  );
}

function Regra503020({ r }: { r: IResumo }) {
  const grupos: GrupoCategoria[] = ["ESSENCIAL", "DESEJO", "POUPANCA"];
  return (
    <Bloco titulo="Regra 50/30/20">
      <p className="mb-4 text-sm text-mudo">Metade para o essencial, 30% para desejos e pelo menos 20% guardado.</p>
      <div className="grid grid-cols-3 gap-3">
        {grupos.map((g) => {
          const pct = porcentagem(r.porGrupo[g] ?? 0, r.entradasCentavos);
          const meta = META_GRUPO[g];
          const fora = g === "POUPANCA" ? pct < meta : pct > meta;
          return (
            <div key={g} className="border-l border-linha pl-3 first:border-l-0 first:pl-0">
              <p className="text-xs text-mudo">{ROTULO_GRUPO[g]}</p>
              <p className={`num font-display text-[2rem] leading-tight ${fora && pct > 0 ? "text-alerta" : ""}`}>{Math.round(pct)}%</p>
              <p className="text-xs text-mudo">meta {meta}%</p>
            </div>
          );
        })}
      </div>
    </Bloco>
  );
}

function UltimosLancamentos() {
  const { competencia } = useCompetencia();
  const { abrirEdicao, abrirNovoLancamento } = useApp();
  const { dados, carregando } = useDados(() => LancamentosService.listar({ competencia }), [competencia]);
  const ultimos = (dados ?? []).slice(0, 5);

  return (
    <Bloco
      titulo="Últimos lançamentos"
      acao={
        <Link href="/lancamentos" className="text-sm font-semibold text-dinheiro">
          Ver todos
        </Link>
      }
    >
      {carregando && !dados ? (
        <Esqueleto className="h-40" />
      ) : ultimos.length === 0 ? (
        <Vazio
          texto="Nada anotado neste mês."
          acao={<Botao onClick={() => abrirNovoLancamento()}>Adicionar gasto</Botao>}
        />
      ) : (
        <ul className="-mx-1">
          {ultimos.map((l) => (
            <ItemLancamento key={l.id} lancamento={l} aoClicar={() => abrirEdicao(l)} />
          ))}
        </ul>
      )}
    </Bloco>
  );
}

function Evolucao() {
  const { dados } = useDados(() => ResumoService.evolucao(6), []);
  if (!dados || dados.length < 2) return null;
  const pontos = dados.map((m) => ({
    mes: nomeMesCurto(m.competencia),
    Entradas: m.entradasCentavos / 100,
    Saídas: m.saidasCentavos / 100,
    Sobra: m.sobraCentavos / 100,
  }));
  const moeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <Bloco titulo="Últimos 6 meses">
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <ComposedChart data={pontos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--linha)" />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: "var(--mudo)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} width={72} tick={{ fill: "var(--mudo)", fontSize: 12 }} tickFormatter={moeda} />
            <Tooltip
              formatter={(v) => moeda(Number(v))}
              contentStyle={{ background: "var(--superficie)", border: "1px solid var(--linha)", borderRadius: 12, color: "var(--tinta)" }}
            />
            <Bar dataKey="Entradas" fill="var(--dinheiro)" radius={[3, 3, 0, 0]} maxBarSize={22} />
            <Bar dataKey="Saídas" fill="var(--linha)" radius={[3, 3, 0, 0]} maxBarSize={22} />
            <Line dataKey="Sobra" stroke="var(--latao)" strokeWidth={1.75} dot={{ r: 3, fill: "var(--latao)", strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-sm text-mudo">Barras: entradas e saídas. Linha: quanto sobrou em cada mês.</p>
    </Bloco>
  );
}

function PainelCarregando() {
  return (
    <div className="flex flex-col gap-6">
      <Esqueleto className="h-10 w-64" />
      <Esqueleto className="h-72 rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Esqueleto className="h-64" />
        <Esqueleto className="h-64" />
      </div>
    </div>
  );
}
