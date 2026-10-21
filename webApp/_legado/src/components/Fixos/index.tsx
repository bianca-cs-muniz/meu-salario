"use client";

import { useState } from "react";
import { useApp } from "@/contexts/app";
import { useDados } from "@/hooks/useDados";
import GastosFixosService from "@/services/gastos-fixos/gastos-fixos.service";
import CategoriasService from "@/services/categorias/categorias.service";
import CartoesService from "@/services/cartoes/cartoes.service";
import CarteirasService from "@/services/carteiras/carteiras.service";
import { FormaPagamento, IRecorrencia, ISalvarRecorrencia, TipoLancamento } from "@/services/tipos";
import { Alternador, Bloco, Botao, Campo, Chips, Entrada, ErroCarregar, Esqueleto, MensagemErro, Selecao, TituloPagina, Vazio } from "@/shared/components/ui";
import { Confirmar, Modal } from "@/shared/components/Modal";
import { CampoDinheiro } from "@/shared/components/CampoDinheiro";
import { IconeCategoria } from "@/shared/components/Icone";
import { ROTULO_FORMA } from "@/shared/components/rotulos";
import { formatarDinheiro } from "@/utils/dinheiro";

export function Fixos() {
  const { dados, carregando, erro, recarregar } = useDados(() => GastosFixosService.listar(), []);
  const [editando, setEditando] = useState<IRecorrencia | TipoLancamento | null>(null);
  const ativos = (dados ?? []).filter((r) => r.ativa);

  const secoes = [
    { titulo: "Entradas fixas", itens: ativos.filter((r) => r.tipo === "ENTRADA"), entrada: true },
    { titulo: "Fixos da casa", itens: ativos.filter((r) => r.tipo === "SAIDA" && r.formaPagamento !== "CREDITO"), entrada: false },
    { titulo: "Fixos no cartão", itens: ativos.filter((r) => r.tipo === "SAIDA" && r.formaPagamento === "CREDITO"), entrada: false },
  ];

  return (
    <div>
      <TituloPagina lado={<Botao onClick={() => setEditando("SAIDA")}>Novo fixo</Botao>}>Gastos fixos</TituloPagina>
      <p className="-mt-3 mb-6 text-mudo">Entram sozinhos todo mês. Mudar o valor aqui vale para os próximos meses.</p>

      {erro ? (
        <ErroCarregar mensagem={erro} tentar={recarregar} />
      ) : carregando && !dados ? (
        <div className="flex flex-col gap-4">
          <Esqueleto className="h-32" />
          <Esqueleto className="h-48" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {secoes.map((s) => {
            const total = s.itens.reduce((t, r) => t + r.valorCentavos, 0);
            return (
              <Bloco
                key={s.titulo}
                titulo={s.titulo}
                acao={s.itens.length > 0 && <span className={`num font-semibold ${s.entrada ? "text-dinheiro" : ""}`}>{formatarDinheiro(total)}/mês</span>}
              >
                {s.itens.length === 0 ? (
                  <Vazio
                    texto={s.entrada ? "Nenhuma entrada fixa." : "Nenhum gasto fixo aqui ainda."}
                    acao={
                      <Botao variante="secundario" onClick={() => setEditando(s.entrada ? "ENTRADA" : "SAIDA")}>
                        Adicionar
                      </Botao>
                    }
                  />
                ) : (
                  <ul className="-mx-1">
                    {s.itens.map((r) => (
                      <li key={r.id}>
                        <button onClick={() => setEditando(r)} className="flex w-full items-center gap-3 rounded-xl px-1 py-2.5 text-left hover:bg-papel/70 cursor-pointer">
                          <IconeCategoria nome={r.categoria?.icone ?? "wallet"} cor={r.categoria?.cor ?? "#795064"} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">{r.descricao}</span>
                            <span className="text-sm text-mudo">
                              Dia {r.diaDoMes} · {r.cartao?.nome ?? ROTULO_FORMA[r.formaPagamento]}
                              {r.categoria && ` · ${r.categoria.nome}`}
                            </span>
                          </span>
                          <span className={`num font-semibold ${r.tipo === "ENTRADA" ? "text-dinheiro" : ""}`}>{formatarDinheiro(r.valorCentavos)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Bloco>
            );
          })}
        </div>
      )}

      {editando && (
        <FormFixo
          recorrencia={typeof editando === "string" ? undefined : editando}
          tipoInicial={typeof editando === "string" ? editando : editando.tipo}
          aoFechar={() => setEditando(null)}
        />
      )}
    </div>
  );
}

function FormFixo({ recorrencia, tipoInicial, aoFechar }: { recorrencia?: IRecorrencia; tipoInicial: TipoLancamento; aoFechar: () => void }) {
  const { avisarMudanca, mostrarToast } = useApp();
  const opcoes = useDados(() => Promise.all([CategoriasService.listar(), CartoesService.listar(), CarteirasService.listar()]), []);
  const [categorias, cartoes, carteiras] = opcoes.dados ?? [[], [], []];

  const [tipo, setTipo] = useState<TipoLancamento>(tipoInicial);
  const [descricao, setDescricao] = useState(recorrencia?.descricao ?? "");
  const [valor, setValor] = useState<number | null>(recorrencia?.valorCentavos ?? null);
  const [dia, setDia] = useState(String(recorrencia?.diaDoMes ?? ""));
  const [forma, setForma] = useState<FormaPagamento>(recorrencia?.formaPagamento ?? "PIX");
  const [categoriaId, setCategoriaId] = useState(recorrencia?.categoriaId ?? "");
  const [cartaoId, setCartaoId] = useState(recorrencia?.cartaoId ?? "");
  const [carteiraId, setCarteiraId] = useState(recorrencia?.carteiraId ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmarEncerrar, setConfirmarEncerrar] = useState(false);

  // Padrões derivados: primeiro cartão e a conta principal.
  const cartaoEfetivo = cartaoId || cartoes[0]?.id || "";
  const carteiraEfetiva = carteiraId || carteiras.find((c) => c.tipo === "CONTA")?.id || "";

  const formas: FormaPagamento[] = ["PIX", "DEBITO", ...(cartoes.length ? (["CREDITO"] as const) : []), "DINHEIRO"];

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const d = Number(dia);
    if (!descricao.trim()) return setErro("Escreva uma descrição, por exemplo \u201cAluguel\u201d.");
    if (!valor || valor <= 0) return setErro("Digite um valor maior que zero.");
    if (!(d >= 1 && d <= 28)) return setErro("O dia precisa ser entre 1 e 28.");
    if (tipo === "SAIDA" && !categoriaId) return setErro("Escolha uma categoria.");

    const carteira = carteiras.find((c) => c.id === carteiraEfetiva);
    const corpo: ISalvarRecorrencia = {
      tipo,
      descricao: descricao.trim(),
      valorCentavos: valor,
      diaDoMes: d,
      formaPagamento: tipo === "ENTRADA" ? (carteira?.tipo === "VR" ? "VR" : "PIX") : forma,
      categoriaId: tipo === "SAIDA" ? categoriaId : undefined,
      cartaoId: tipo === "SAIDA" && forma === "CREDITO" ? cartaoEfetivo : undefined,
      carteiraId: tipo === "ENTRADA" ? carteiraEfetiva : forma === "CREDITO" ? undefined : carteiras.find((c) => c.tipo === "CONTA")?.id,
    };

    setErro(null);
    setSalvando(true);
    try {
      if (recorrencia) await GastosFixosService.editar(recorrencia.id, corpo);
      else await GastosFixosService.criar(corpo);
      mostrarToast(recorrencia ? "Fixo atualizado" : "Fixo adicionado");
      avisarMudanca();
      aoFechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function encerrar() {
    setConfirmarEncerrar(false);
    try {
      await GastosFixosService.encerrar(recorrencia!.id);
      mostrarToast("Fixo encerrado");
      avisarMudanca();
      aoFechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível encerrar.");
    }
  }

  return (
    <Modal titulo={recorrencia ? "Editar fixo" : "Novo fixo"} aoFechar={aoFechar}>
      {!opcoes.dados ? (
        <Esqueleto className="h-64" />
      ) : (
        <form onSubmit={salvar} className="flex flex-col gap-4">
          {!recorrencia && (
            <Alternador opcoes={[{ valor: "SAIDA", texto: "Gasto" }, { valor: "ENTRADA", texto: "Entrada" }]} valor={tipo} aoMudar={setTipo} />
          )}
          <Campo rotulo="Descrição">
            <Entrada value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={tipo === "SAIDA" ? "Aluguel, internet, Netflix…" : "Salário, aluguel recebido…"} />
          </Campo>
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <Campo rotulo="Valor">
              <CampoDinheiro valor={valor} aoMudar={setValor} rotuloAcessivel="Valor" />
            </Campo>
            <Campo rotulo="Dia">
              <Entrada inputMode="numeric" value={dia} onChange={(e) => setDia(e.target.value.replace(/\D/g, ""))} />
            </Campo>
          </div>

          {tipo === "SAIDA" ? (
            <>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-mudo">Como é pago</legend>
                <Chips rotulo="Como é pago" opcoes={formas.map((f) => ({ valor: f, texto: ROTULO_FORMA[f] }))} valor={forma} aoMudar={setForma} />
              </fieldset>
              {forma === "CREDITO" && cartoes.length > 1 && (
                <Campo rotulo="Cartão">
                  <Selecao value={cartaoEfetivo} onChange={(e) => setCartaoId(e.target.value)}>
                    {cartoes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </Selecao>
                </Campo>
              )}
              <Campo rotulo="Categoria">
                <Selecao value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                  <option value="">Escolha…</option>
                  {categorias.filter((c) => c.ativa).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Selecao>
              </Campo>
            </>
          ) : (
            carteiras.length > 1 && (
              <Campo rotulo="Onde entra">
                <Selecao value={carteiraEfetiva} onChange={(e) => setCarteiraId(e.target.value)}>
                  {carteiras.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Selecao>
              </Campo>
            )
          )}

          <MensagemErro texto={erro} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            {recorrencia ? (
              <Botao type="button" variante="fantasma" className="text-alerta hover:bg-alerta-suave" onClick={() => setConfirmarEncerrar(true)}>
                Encerrar
              </Botao>
            ) : (
              <span />
            )}
            <Botao type="submit" carregando={salvando}>
              {recorrencia ? "Salvar alterações" : "Adicionar fixo"}
            </Botao>
          </div>
        </form>
      )}
      {confirmarEncerrar && (
        <Confirmar
          titulo="Encerrar fixo"
          texto={`\u201c${recorrencia!.descricao}\u201d deixa de entrar nos próximos meses. Os meses passados continuam como estão.`}
          opcoes={[{ texto: "Encerrar", perigo: true, acao: encerrar }]}
          aoFechar={() => setConfirmarEncerrar(false)}
        />
      )}
    </Modal>
  );
}
