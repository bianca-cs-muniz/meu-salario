"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/contexts/app";
import { useCompetencia } from "@/hooks/useCompetencia";
import { useDados } from "@/hooks/useDados";
import LancamentosService from "@/services/lancamentos/lancamentos.service";
import CategoriasService from "@/services/categorias/categorias.service";
import CartoesService from "@/services/cartoes/cartoes.service";
import { FormaPagamento, IFiltroLancamentos, ILancamento, OrigemLancamento } from "@/services/tipos";
import { Botao, ErroCarregar, Esqueleto, TituloPagina, Vazio } from "@/shared/components/ui";
import { SeletorMes } from "@/shared/components/SeletorMes";
import { ItemLancamento } from "@/shared/components/ItemLancamento";
import { ROTULO_FORMA } from "@/shared/components/rotulos";
import { formatarDinheiro } from "@/utils/dinheiro";
import { chaveDia, rotuloDia } from "@/utils/datas";

export function Lancamentos() {
  const { competencia } = useCompetencia();
  const { abrirEdicao, abrirNovoLancamento } = useApp();
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [filtro, setFiltro] = useState<Omit<IFiltroLancamentos, "competencia" | "busca">>({});

  // Espera a pessoa parar de digitar para buscar.
  useEffect(() => {
    const t = setTimeout(() => setBuscaAplicada(busca.trim()), 350);
    return () => clearTimeout(t);
  }, [busca]);

  const chaveFiltro = JSON.stringify(filtro);
  const lista = useDados(
    () => LancamentosService.listar({ competencia, busca: buscaAplicada || undefined, ...filtro }),
    [competencia, buscaAplicada, chaveFiltro],
  );
  const opcoes = useDados(() => Promise.all([CategoriasService.listar(), CartoesService.listar()]), []);
  const [categorias, cartoes] = opcoes.dados ?? [[], []];

  const grupos = useMemo(() => agruparPorDia(lista.dados ?? []), [lista.dados]);
  const totais = useMemo(() => {
    const itens = lista.dados ?? [];
    return {
      entradas: itens.filter((l) => l.tipo === "ENTRADA").reduce((s, l) => s + l.valorCentavos, 0),
      saidas: itens.filter((l) => l.tipo === "SAIDA").reduce((s, l) => s + l.valorCentavos, 0),
    };
  }, [lista.dados]);
  const temFiltro = Object.values(filtro).some((v) => v !== undefined) || !!buscaAplicada;

  function mudar<K extends keyof typeof filtro>(chave: K, valor: (typeof filtro)[K] | "") {
    setFiltro((f) => ({ ...f, [chave]: valor === "" ? undefined : valor }));
  }

  return (
    <div>
      <TituloPagina lado={<SeletorMes />}>Lançamentos</TituloPagina>

      <div className="mb-4 flex flex-col gap-3">
        <label className="flex items-center gap-2 rounded-xl border border-linha bg-superficie px-3 py-2.5 focus-within:border-dinheiro">
          <Search size={18} className="text-mudo" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por descrição"
            aria-label="Buscar por descrição"
            className="w-full bg-transparent focus:outline-none"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FiltroSelect rotulo="Categoria" valor={filtro.categoriaId ?? ""} aoMudar={(v) => mudar("categoriaId", v)}>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </FiltroSelect>
          <FiltroSelect rotulo="Pagamento" valor={filtro.formaPagamento ?? ""} aoMudar={(v) => mudar("formaPagamento", v as FormaPagamento)}>
            {(Object.keys(ROTULO_FORMA) as FormaPagamento[]).map((f) => (
              <option key={f} value={f}>
                {ROTULO_FORMA[f]}
              </option>
            ))}
          </FiltroSelect>
          {cartoes.length > 0 && (
            <FiltroSelect rotulo="Cartão" valor={filtro.cartaoId ?? ""} aoMudar={(v) => mudar("cartaoId", v)}>
              {cartoes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </FiltroSelect>
          )}
          <FiltroSelect rotulo="Origem" valor={filtro.origem ?? ""} aoMudar={(v) => mudar("origem", v as OrigemLancamento)}>
            <option value="APP">App</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="RECORRENCIA">Gastos fixos</option>
          </FiltroSelect>
          <button
            onClick={() => mudar("revisado", filtro.revisado === false ? "" : false)}
            aria-pressed={filtro.revisado === false}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold cursor-pointer ${
              filtro.revisado === false ? "border-atencao bg-atencao-suave text-atencao" : "border-linha bg-superficie"
            }`}
          >
            Só para revisar
          </button>
          {temFiltro && (
            <button
              onClick={() => {
                setFiltro({});
                setBusca("");
              }}
              className="shrink-0 px-2 text-sm font-semibold text-dinheiro cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {lista.erro ? (
        <ErroCarregar mensagem={lista.erro} tentar={lista.recarregar} />
      ) : lista.carregando && !lista.dados ? (
        <div className="flex flex-col gap-3">
          <Esqueleto className="h-14" />
          <Esqueleto className="h-14" />
          <Esqueleto className="h-14" />
        </div>
      ) : grupos.length === 0 ? (
        <Vazio
          texto={temFiltro ? "Nenhum lançamento com esses filtros." : "Nada anotado neste mês."}
          acao={!temFiltro && <Botao onClick={() => abrirNovoLancamento()}>Adicionar gasto</Botao>}
        />
      ) : (
        <div className="flex flex-col gap-5">
          {grupos.map((g) => (
            <section key={g.dia} className="rounded-xl border border-linha bg-superficie px-4 py-3">
              <header className="mb-1 flex items-baseline justify-between text-sm">
                <h2 className="font-semibold">{rotuloDia(g.itens[0].data)}</h2>
                {g.saidas > 0 && <span className="num text-mudo">− {formatarDinheiro(g.saidas)}</span>}
              </header>
              <ul className="-mx-1">
                {g.itens.map((l) => (
                  <ItemLancamento key={l.id} lancamento={l} aoClicar={() => abrirEdicao(l)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {(lista.dados?.length ?? 0) > 0 && (
        <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] mt-6 flex justify-between rounded-xl border border-linha bg-superficie px-4 py-3 text-sm md:bottom-4">
          <span>
            Entradas <strong className="num text-dinheiro">{formatarDinheiro(totais.entradas)}</strong>
          </span>
          <span>
            Saídas <strong className="num">{formatarDinheiro(totais.saidas)}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

function FiltroSelect({
  rotulo,
  valor,
  aoMudar,
  children,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={rotulo}
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
      className={`shrink-0 rounded-full border bg-superficie px-3 py-1.5 text-sm font-semibold text-tinta focus:outline-none ${
        valor ? "border-dinheiro" : "border-linha"
      }`}
    >
      <option value="">{rotulo}</option>
      {children}
    </select>
  );
}

function agruparPorDia(itens: ILancamento[]) {
  const mapa = new Map<string, ILancamento[]>();
  [...itens]
    .sort((a, b) => b.data.localeCompare(a.data))
    .forEach((l) => {
      const dia = chaveDia(l.data);
      mapa.set(dia, [...(mapa.get(dia) ?? []), l]);
    });
  return [...mapa.entries()].map(([dia, lista]) => ({
    dia,
    itens: lista,
    saidas: lista.filter((l) => l.tipo === "SAIDA").reduce((s, l) => s + l.valorCentavos, 0),
  }));
}
