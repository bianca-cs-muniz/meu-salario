"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { useApp } from "@/contexts/app";
import { useDados } from "@/hooks/useDados";
import CartoesService, { ISalvarCartao } from "@/services/cartoes/cartoes.service";
import { ICartao } from "@/services/tipos";
import { BarraProgresso, Botao, Campo, Entrada, ErroCarregar, Esqueleto, MensagemErro, TituloPagina, Vazio } from "@/shared/components/ui";
import { Modal } from "@/shared/components/Modal";
import { CampoDinheiro } from "@/shared/components/CampoDinheiro";
import { CLASSE_STATUS_FATURA, ROTULO_STATUS_FATURA } from "@/shared/components/rotulos";
import { formatarDinheiro, porcentagem } from "@/utils/dinheiro";
import { dataCurta, nomeMesSemAno } from "@/utils/datas";

export const CORES_CARTAO = ["#795064", "#C97896", "#5C3A4B", "#8A05BE", "#EC7000", "#CC092F", "#3B2531", "#6F6A9E"];

export function Cartoes() {
  const { dados, carregando, erro, recarregar } = useDados(() => CartoesService.listar(), []);
  const [editando, setEditando] = useState<ICartao | "novo" | null>(null);
  const cartoes = (dados ?? []).filter((c) => c.ativo);

  return (
    <div>
      <TituloPagina lado={<Botao onClick={() => setEditando("novo")}>Novo cartão</Botao>}>Cartões</TituloPagina>

      {erro ? (
        <ErroCarregar mensagem={erro} tentar={recarregar} />
      ) : carregando && !dados ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Esqueleto className="h-44" />
          <Esqueleto className="h-44" />
        </div>
      ) : cartoes.length === 0 ? (
        <Vazio
          texto="Nenhum cartão cadastrado. Cadastre para o app saber em qual fatura cada compra cai."
          acao={<Botao onClick={() => setEditando("novo")}>Cadastrar cartão</Botao>}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {cartoes.map((c) => (
            <li key={c.id} className="relative overflow-hidden rounded-xl border border-linha bg-superficie">
              <Link href={`/cartoes/${c.id}`} className="block p-3 hover:bg-papel/40">
                {/* A face do cartão, na cor dele */}
                <div
                  className="relative flex aspect-[1.9/1] flex-col justify-between overflow-hidden rounded-lg p-5 text-[#f6f1e7]"
                  style={{ background: c.cor }}
                >
                  <span aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(255,255,255,0.16),transparent_60%)]" />
                  <span aria-hidden className="absolute inset-0 bg-black/15" />
                  <p className="relative font-display text-[1.9rem] leading-none">{c.nome}</p>
                  <div className="relative flex items-end justify-between gap-3 text-[0.8rem] text-white/75">
                    <span>
                      Fecha dia {c.diaFechamento}
                      <br />
                      Vence dia {c.diaVencimento}
                    </span>
                    <span aria-hidden className="h-7 w-10 rounded-md border border-white/30 bg-gradient-to-br from-[#e6cf9e] to-[#a8824c] opacity-90" />
                  </div>
                </div>
                <div className="px-2 pb-2 pt-5">
                  {c.faturaAtual ? (
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-sm text-mudo">Fatura de {nomeMesSemAno(c.faturaAtual.competencia)}</p>
                        <p className="num mt-1 font-display text-[2.4rem] leading-none">{formatarDinheiro(c.faturaAtual.totalCentavos)}</p>
                      </div>
                      <div className="text-right text-sm">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CLASSE_STATUS_FATURA[c.faturaAtual.status]}`}>
                          {ROTULO_STATUS_FATURA[c.faturaAtual.status]}
                        </span>
                        <p className="mt-1.5 text-mudo">Vence {dataCurta(c.faturaAtual.vencimento)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-mudo">Sem fatura em aberto.</p>
                  )}
                  {c.limiteCentavos ? (
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm text-mudo">
                        <span>Limite usado</span>
                        <span className="num">
                          {formatarDinheiro(c.limiteUsadoCentavos)} de {formatarDinheiro(c.limiteCentavos)}
                        </span>
                      </div>
                      <BarraProgresso valor={porcentagem(c.limiteUsadoCentavos, c.limiteCentavos)} cor={c.cor} />
                    </div>
                  ) : null}
                </div>
              </Link>
              <button
                onClick={() => setEditando(c)}
                aria-label={`Editar ${c.nome}`}
                className="absolute right-6 top-6 rounded-full p-2 text-white/80 hover:bg-white/15 cursor-pointer"
              >
                <Pencil size={15} strokeWidth={1.6} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {editando && <FormCartao cartao={editando === "novo" ? undefined : editando} aoFechar={() => setEditando(null)} />}
    </div>
  );
}

function FormCartao({ cartao, aoFechar }: { cartao?: ICartao; aoFechar: () => void }) {
  const { avisarMudanca, mostrarToast } = useApp();
  const [nome, setNome] = useState(cartao?.nome ?? "");
  const [fechamento, setFechamento] = useState(String(cartao?.diaFechamento ?? ""));
  const [vencimento, setVencimento] = useState(String(cartao?.diaVencimento ?? ""));
  const [limite, setLimite] = useState<number | null>(cartao?.limiteCentavos ?? null);
  const [cor, setCor] = useState(cartao?.cor ?? CORES_CARTAO[0]);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const f = Number(fechamento);
    const v = Number(vencimento);
    if (!nome.trim()) return setErro("Dê um nome ao cartão, por exemplo Nubank.");
    if (!(f >= 1 && f <= 28) || !(v >= 1 && v <= 28)) return setErro("Os dias de fechamento e vencimento precisam ser entre 1 e 28.");
    setErro(null);
    setSalvando(true);
    const corpo: ISalvarCartao = { nome: nome.trim(), diaFechamento: f, diaVencimento: v, limiteCentavos: limite || null, cor };
    try {
      if (cartao) await CartoesService.editar(cartao.id, corpo);
      else await CartoesService.criar(corpo);
      mostrarToast(cartao ? "Cartão atualizado" : "Cartão cadastrado");
      avisarMudanca();
      aoFechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    try {
      await CartoesService.excluir(cartao!.id);
      mostrarToast("Cartão removido");
      avisarMudanca();
      aoFechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível remover.");
    }
  }

  return (
    <Modal titulo={cartao ? "Editar cartão" : "Novo cartão"} aoFechar={aoFechar}>
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <Campo rotulo="Nome">
          <Entrada value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nubank, Inter…" autoFocus />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Dia do fechamento">
            <Entrada inputMode="numeric" value={fechamento} onChange={(e) => setFechamento(e.target.value.replace(/\D/g, ""))} />
          </Campo>
          <Campo rotulo="Dia do vencimento">
            <Entrada inputMode="numeric" value={vencimento} onChange={(e) => setVencimento(e.target.value.replace(/\D/g, ""))} />
          </Campo>
        </div>
        <Campo rotulo="Limite (opcional)">
          <CampoDinheiro valor={limite} aoMudar={setLimite} rotuloAcessivel="Limite" />
        </Campo>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-mudo">Cor</legend>
          <div className="flex flex-wrap gap-2">
            {CORES_CARTAO.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Cor ${c}`}
                aria-pressed={c === cor}
                onClick={() => setCor(c)}
                className={`h-9 w-9 rounded-full border-2 cursor-pointer ${c === cor ? "border-tinta" : "border-transparent"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </fieldset>
        <MensagemErro texto={erro} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {cartao ? (
            <Botao type="button" variante="fantasma" className="text-alerta hover:bg-alerta-suave" onClick={remover}>
              Remover cartão
            </Botao>
          ) : (
            <span />
          )}
          <Botao type="submit" carregando={salvando}>
            {cartao ? "Salvar alterações" : "Cadastrar cartão"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
