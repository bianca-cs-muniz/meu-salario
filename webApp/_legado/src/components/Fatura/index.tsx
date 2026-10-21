"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/contexts/app";
import { useDados } from "@/hooks/useDados";
import FaturasService from "@/services/faturas/faturas.service";
import { ILancamento } from "@/services/tipos";
import { BarraProgresso, Bloco, Botao, ErroCarregar, Esqueleto, Vazio } from "@/shared/components/ui";
import { ItemLancamento } from "@/shared/components/ItemLancamento";
import { IconeCategoria } from "@/shared/components/Icone";
import { CLASSE_STATUS_FATURA, ROTULO_STATUS_FATURA } from "@/shared/components/rotulos";
import { formatarDinheiro, porcentagem } from "@/utils/dinheiro";
import { capitalizar, competenciaAtual, dataCurta, nomeMes, nomeMesSemAno, somarMeses } from "@/utils/datas";

export function Fatura({ cartaoId, competenciaInicial }: { cartaoId: string; competenciaInicial?: string }) {
  const { abrirEdicao, avisarMudanca, mostrarToast } = useApp();
  const [competencia, setCompetencia] = useState(competenciaInicial ?? competenciaAtual());
  const { dados: f, carregando, erro, recarregar } = useDados(() => FaturasService.buscar(cartaoId, competencia), [cartaoId, competencia]);
  const [pagando, setPagando] = useState(false);

  async function alternarPagamento() {
    if (!f?.id) return;
    setPagando(true);
    try {
      if (f.pagaEm) {
        await FaturasService.desfazerPagamento(f.id);
        mostrarToast("Pagamento desfeito");
      } else {
        await FaturasService.pagar(f.id);
        mostrarToast("Fatura marcada como paga");
      }
      avisarMudanca();
    } catch (e) {
      mostrarToast(e instanceof Error ? e.message : "Não foi possível atualizar.", "erro");
    } finally {
      setPagando(false);
    }
  }

  return (
    <div>
      <Link href="/cartoes" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-mudo hover:text-tinta">
        <ChevronLeft size={16} /> Cartões
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-5xl leading-none">{f?.cartao.nome ?? "Fatura"}</h1>
        <nav aria-label="Fatura" className="flex items-center rounded-full border border-linha p-1">
          <button onClick={() => setCompetencia((c) => somarMeses(c, -1))} aria-label="Fatura anterior" className="grid h-8 w-8 place-items-center rounded-full hover:bg-papel cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-36 text-center font-display text-lg leading-none">{nomeMes(competencia)}</span>
          <button onClick={() => setCompetencia((c) => somarMeses(c, 1))} aria-label="Próxima fatura" className="grid h-8 w-8 place-items-center rounded-full hover:bg-papel cursor-pointer">
            <ChevronRight size={18} />
          </button>
        </nav>
      </div>

      {erro ? (
        <ErroCarregar mensagem={erro} tentar={recarregar} />
      ) : !f || (carregando && f.competencia !== competencia) ? (
        <div className="flex flex-col gap-4">
          <Esqueleto className="h-36" />
          <Esqueleto className="h-64" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <section className="relative overflow-hidden rounded-2xl bg-cofre p-6 text-cofre-tinta md:p-8">
            <span aria-hidden className="absolute inset-x-6 top-0 h-px md:inset-x-8" style={{ background: f.cartao.cor }} />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CLASSE_STATUS_FATURA[f.status]}`}>
                  {ROTULO_STATUS_FATURA[f.status]}
                </span>
                <p className="num mt-3 font-display text-[clamp(3rem,11vw,4.8rem)] leading-none">{formatarDinheiro(f.totalCentavos)}</p>
                <p className="mt-3 text-sm text-cofre-mudo">
                  Fecha {dataCurta(f.fechamento)} · vence {dataCurta(f.vencimento)}
                  {f.pagaEm && ` · paga em ${dataCurta(f.pagaEm)}`}
                </p>
              </div>
              {f.id && f.status !== "ABERTA" && (
                <Botao variante="secundario" className="border-latao/60 !text-cofre-tinta hover:!bg-latao/15" carregando={pagando} onClick={alternarPagamento}>
                  {f.pagaEm ? "Desfazer pagamento" : "Marcar como paga"}
                </Botao>
              )}
            </div>
          </section>

          {f.totalCentavos === 0 && f.fixos.length + f.parcelas.length + f.avulsos.length === 0 ? (
            <Vazio texto={`Nenhuma compra na fatura de ${nomeMesSemAno(competencia)}.`} />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
              <div className="flex flex-col gap-6">
                <GrupoFatura titulo="Fixos do cartão" itens={f.fixos} abrir={abrirEdicao} />
                <GrupoFatura titulo="Parcelas" itens={f.parcelas} abrir={abrirEdicao} />
                <GrupoFatura titulo="Avulsos" itens={f.avulsos} abrir={abrirEdicao} />
              </div>
              <div className="flex flex-col gap-6">
                {f.porCategoria.length > 0 && (
                  <Bloco titulo="Por categoria">
                    <ul className="flex flex-col gap-3">
                      {f.porCategoria.map((c) => (
                        <li key={c.categoriaId} className="flex items-center gap-3">
                          <IconeCategoria nome={c.icone} cor={c.cor} tamanho={30} />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex justify-between text-sm">
                              <span className="font-semibold">{c.nome}</span>
                              <span className="num text-mudo">{formatarDinheiro(c.totalCentavos)}</span>
                            </div>
                            <BarraProgresso valor={porcentagem(c.totalCentavos, f.totalCentavos)} cor={c.cor} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Bloco>
                )}
                {f.proximas.some((p) => p.totalCentavos > 0) && (
                  <Bloco titulo="Próximas faturas">
                    <p className="mb-3 text-sm text-mudo">Já comprometido com parcelas e fixos.</p>
                    <ul className="flex flex-col gap-2">
                      {f.proximas.map((p) => (
                        <li key={p.competencia}>
                          <button
                            onClick={() => setCompetencia(p.competencia)}
                            className="flex w-full justify-between rounded-xl px-2 py-1.5 hover:bg-papel cursor-pointer"
                          >
                            <span>{capitalizar(nomeMesSemAno(p.competencia))}</span>
                            <span className="num font-semibold">{formatarDinheiro(p.totalCentavos)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </Bloco>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GrupoFatura({ titulo, itens, abrir }: { titulo: string; itens: ILancamento[]; abrir: (l: ILancamento) => void }) {
  if (itens.length === 0) return null;
  const total = itens.reduce((s, l) => s + (l.tipo === "SAIDA" ? l.valorCentavos : -l.valorCentavos), 0);
  return (
    <Bloco titulo={titulo} acao={<span className="num text-sm font-semibold text-mudo">{formatarDinheiro(total)}</span>}>
      <ul className="-mx-1">
        {itens.map((l) => (
          <ItemLancamento key={l.id} lancamento={l} aoClicar={() => abrir(l)} />
        ))}
      </ul>
    </Bloco>
  );
}
