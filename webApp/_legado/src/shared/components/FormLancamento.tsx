"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/app";
import CategoriasService from "@/services/categorias/categorias.service";
import CartoesService from "@/services/cartoes/cartoes.service";
import CarteirasService from "@/services/carteiras/carteiras.service";
import LancamentosService from "@/services/lancamentos/lancamentos.service";
import { ICartao, ICarteira, ICategoria, FormaPagamento, ILancamento, TipoLancamento } from "@/services/tipos";
import { formatarDinheiro } from "@/utils/dinheiro";
import { dataCurta, deInputData, nomeMesSemAno, paraInputData } from "@/utils/datas";
import { Modal, Confirmar } from "./Modal";
import { CampoDinheiro } from "./CampoDinheiro";
import { Alternador, Botao, Campo, Chips, Entrada, Esqueleto, MensagemErro, Selecao } from "./ui";
import { IconeCategoria } from "./Icone";
import { ROTULO_FORMA } from "./rotulos";

const FORMAS: FormaPagamento[] = ["PIX", "DEBITO", "CREDITO", "VR", "DINHEIRO"];

/** Formulário único de gasto/entrada. É aberto pelo AppContext (abrirNovoLancamento / abrirEdicao). */
export function FormLancamento() {
  const { formAberto, fecharForm } = useApp();
  if (!formAberto) return null;
  return (
    <ConteudoForm
      key={formAberto.lancamento?.id ?? "novo"}
      lancamento={formAberto.lancamento}
      tipoInicial={formAberto.tipoInicial}
      aoFechar={fecharForm}
    />
  );
}

function ConteudoForm({
  lancamento,
  tipoInicial,
  aoFechar,
}: {
  lancamento?: ILancamento;
  tipoInicial?: TipoLancamento;
  aoFechar: () => void;
}) {
  const { avisarMudanca, mostrarToast } = useApp();
  const editando = !!lancamento;

  const [opcoes, setOpcoes] = useState<{ categorias: ICategoria[]; cartoes: ICartao[]; carteiras: ICarteira[] } | null>(null);
  const [tipo, setTipo] = useState<TipoLancamento>(lancamento?.tipo ?? tipoInicial ?? "SAIDA");
  const [valor, setValor] = useState<number | null>(lancamento?.valorCentavos ?? null);
  const [descricao, setDescricao] = useState(lancamento?.descricao ?? "");
  const [categoriaId, setCategoriaId] = useState<string | null>(lancamento?.categoriaId ?? null);
  const [forma, setForma] = useState<FormaPagamento>(lancamento?.formaPagamento ?? "PIX");
  const [cartaoId, setCartaoId] = useState<string | null>(lancamento?.cartaoId ?? null);
  const [carteiraId, setCarteiraId] = useState<string | null>(lancamento?.carteiraId ?? null);
  const [parcelas, setParcelas] = useState(1);
  const [data, setData] = useState(paraInputData(lancamento?.data));
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [pergunta, setPergunta] = useState<"salvar" | "excluir" | null>(null);

  useEffect(() => {
    Promise.all([CategoriasService.listar(), CartoesService.listar(), CarteirasService.listar()])
      .then(([categorias, cartoes, carteiras]) => {
        const ativos = {
          categorias: categorias.filter((c) => c.ativa),
          cartoes: cartoes.filter((c) => c.ativo),
          carteiras: carteiras.filter((c) => c.ativa),
        };
        setOpcoes(ativos);
        if (!lancamento && ativos.cartoes.length) setCartaoId(ativos.cartoes[0].id);
        if (!lancamento) setCarteiraId(ativos.carteiras.find((c) => c.tipo === "CONTA")?.id ?? null);
      })
      .catch((e) => setErro(e.message));
  }, [lancamento]);

  const carteiraVr = opcoes?.carteiras.find((c) => c.tipo === "VR");
  const formasDisponiveis = FORMAS.filter((f) => (f === "VR" ? !!carteiraVr : f === "CREDITO" ? !!opcoes?.cartoes.length : true));
  const categoriasVisiveis = useMemo(
    () => (opcoes?.categorias ?? []).filter((c) => (forma === "VR" ? c.aceitaVr : true)),
    [opcoes, forma],
  );
  const cartaoEscolhido = opcoes?.cartoes.find((c) => c.id === cartaoId);
  const ehParcela = !!lancamento?.parcelaTotal;
  const ehRecorrencia = !!lancamento?.recorrenciaId;

  function validar(): string | null {
    if (!valor || valor <= 0) return "Digite um valor maior que zero, por exemplo 45,90.";
    if (!descricao.trim()) return tipo === "SAIDA" ? "Escreva uma descrição, por exemplo \u201cmercado\u201d." : "Escreva de onde veio, por exemplo \u201cfreela\u201d.";
    if (tipo === "SAIDA" && !categoriaId) return "Escolha uma categoria.";
    if (tipo === "SAIDA" && forma === "CREDITO" && !cartaoId) return "Escolha o cartão.";
    return null;
  }

  async function salvar(aplicarEmParcelasFuturas = false) {
    const problema = validar();
    if (problema) return setErro(problema);
    if (editando && ehParcela && pergunta !== "salvar") return setPergunta("salvar");
    setPergunta(null);
    setErro(null);
    setSalvando(true);

    const formaFinal: FormaPagamento = tipo === "ENTRADA" ? (carteiraId === carteiraVr?.id ? "VR" : "PIX") : forma;
    const corpo = {
      tipo,
      valorCentavos: valor!,
      descricao: descricao.trim(),
      data: deInputData(data),
      formaPagamento: formaFinal,
      categoriaId: tipo === "SAIDA" ? categoriaId! : undefined,
      cartaoId: tipo === "SAIDA" && forma === "CREDITO" ? cartaoId! : undefined,
      carteiraId: tipo === "ENTRADA" ? carteiraId ?? undefined : forma === "VR" ? carteiraVr?.id : undefined,
    };

    try {
      if (editando) {
        await LancamentosService.editar(lancamento!.id, {
          ...corpo,
          aplicarEmParcelasFuturas,
          ...(lancamento!.revisado ? {} : { revisado: true }),
        });
        mostrarToast("Alterações salvas");
      } else {
        const res = await LancamentosService.criar({ ...corpo, parcelas: forma === "CREDITO" && tipo === "SAIDA" ? parcelas : undefined });
        const partes = [tipo === "SAIDA" ? "Gasto adicionado" : "Entrada adicionada"];
        if (forma === "VR" && res.impacto.saldoVrCentavos != null) partes.push(`Saldo do VR: ${formatarDinheiro(res.impacto.saldoVrCentavos)}`);
        else if (forma === "CREDITO" && res.impacto.faturaTotalCentavos != null)
          partes.push(`Fatura de ${nomeMesSemAno(res.impacto.faturaCompetencia!)}: ${formatarDinheiro(res.impacto.faturaTotalCentavos)}`);
        else partes.push(`Sobra do mês: ${formatarDinheiro(res.impacto.sobraCentavos)}`);
        mostrarToast(partes.join(". "), res.impacto.saldoInsuficiente ? "erro" : "ok");
      }
      avisarMudanca();
      aoFechar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(parcelasFuturas: boolean) {
    setPergunta(null);
    try {
      await LancamentosService.excluir(lancamento!.id, parcelasFuturas);
      mostrarToast(parcelasFuturas ? "Parcelas excluídas" : "Lançamento excluído");
      avisarMudanca();
      aoFechar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível excluir.");
    }
  }

  const titulo = editando ? "Editar lançamento" : tipo === "SAIDA" ? "Novo gasto" : "Nova entrada";
  const dataEhHoje = data === paraInputData();

  return (
    <Modal titulo={titulo} aoFechar={aoFechar}>
      {!opcoes && !erro ? (
        <div className="space-y-3">
          <Esqueleto className="h-12" />
          <Esqueleto className="h-24" />
          <Esqueleto className="h-10" />
        </div>
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            salvar();
          }}
        >
          {!editando && (
            <Alternador
              opcoes={[
                { valor: "SAIDA", texto: "Gasto" },
                { valor: "ENTRADA", texto: "Entrada" },
              ]}
              valor={tipo}
              aoMudar={setTipo}
            />
          )}

          {lancamento?.observacao && !lancamento.revisado && (
            <p className="rounded-xl bg-atencao-suave px-3 py-2 text-sm text-atencao">
              O estagiário anotou: {lancamento.observacao}
            </p>
          )}

          <CampoDinheiro valor={valor} aoMudar={setValor} grande autoFocus={!editando} rotuloAcessivel="Valor" />

          <Campo rotulo="Descrição">
            <Entrada
              value={descricao}
              maxLength={80}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={tipo === "SAIDA" ? "Mercado, Uber, conta de luz…" : "Freela, 13º, venda…"}
            />
          </Campo>

          {tipo === "SAIDA" && (
            <>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1.5 text-sm font-medium text-mudo">Forma de pagamento</legend>
                <Chips
                  rotulo="Forma de pagamento"
                  opcoes={formasDisponiveis.map((f) => ({ valor: f, texto: ROTULO_FORMA[f] }))}
                  valor={forma}
                  aoMudar={(f) => {
                    setForma(f);
                    // VR só vale para algumas categorias: limpa se a escolhida não aceitar.
                    const escolhida = opcoes?.categorias.find((c) => c.id === categoriaId);
                    if (f === "VR" && escolhida && !escolhida.aceitaVr) setCategoriaId(null);
                  }}
                />
                {forma === "VR" && carteiraVr && (
                  <p className="text-sm text-mudo">
                    Saldo do VR: <strong className="num text-tinta">{formatarDinheiro(carteiraVr.saldoCentavos)}</strong>
                  </p>
                )}
              </fieldset>

              {forma === "CREDITO" && (
                <div className={`grid gap-3 ${(opcoes?.cartoes.length ?? 0) > 1 && !editando ? "grid-cols-2" : "grid-cols-1"}`}>
                  {(opcoes?.cartoes.length ?? 0) > 1 && (
                    <Campo rotulo="Cartão">
                      <Selecao value={cartaoId ?? ""} onChange={(e) => setCartaoId(e.target.value)}>
                        {opcoes!.cartoes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nome}
                          </option>
                        ))}
                      </Selecao>
                    </Campo>
                  )}
                  {!editando && (
                    <Campo rotulo="Parcelas">
                      <Selecao value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))}>
                        {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n === 1 ? "À vista" : `${n}x${valor ? ` de ${formatarDinheiro(Math.floor(valor / n))}` : ""}`}
                          </option>
                        ))}
                      </Selecao>
                    </Campo>
                  )}
                  {cartaoEscolhido && !editando && (
                    <p className="col-span-full text-sm text-mudo">
                      {dataEhHoje ? (
                        <>
                          Cai na fatura de <strong className="text-tinta">{nomeMesSemAno(cartaoEscolhido.proximaCompetencia)}</strong>{" "}
                          (vence {dataCurta(cartaoEscolhido.proximoVencimento)}).
                        </>
                      ) : (
                        "A fatura é definida pela data da compra."
                      )}
                    </p>
                  )}
                </div>
              )}

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-mudo">
                  Categoria{forma === "VR" && " (só as que aceitam VR)"}
                </legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {categoriasVisiveis.map((c) => {
                    const ativa = c.id === categoriaId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={ativa}
                        onClick={() => setCategoriaId(c.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-xs font-semibold transition cursor-pointer ${
                          ativa ? "border-dinheiro bg-dinheiro-suave" : "border-linha hover:border-mudo"
                        }`}
                      >
                        <IconeCategoria nome={c.icone} cor={c.cor} tamanho={30} />
                        <span className="line-clamp-1 px-1">{c.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}

          {tipo === "ENTRADA" && (opcoes?.carteiras.length ?? 0) > 1 && (
            <Campo rotulo="Onde entrou">
              <Selecao value={carteiraId ?? ""} onChange={(e) => setCarteiraId(e.target.value)}>
                {opcoes!.carteiras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Selecao>
            </Campo>
          )}

          <Campo rotulo="Data">
            <Entrada type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </Campo>

          {ehRecorrencia && (
            <p className="text-sm text-mudo">
              Este é um gasto fixo. A alteração vale só para este mês; para mudar todos os meses, use Gastos fixos.
            </p>
          )}

          <MensagemErro texto={erro} />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            {editando ? (
              <Botao type="button" variante="fantasma" className="text-alerta hover:bg-alerta-suave" onClick={() => setPergunta("excluir")}>
                Excluir
              </Botao>
            ) : (
              <span />
            )}
            <Botao type="submit" carregando={salvando}>
              {editando ? "Salvar alterações" : tipo === "SAIDA" ? "Adicionar gasto" : "Adicionar entrada"}
            </Botao>
          </div>
        </form>
      )}

      {pergunta === "salvar" && (
        <Confirmar
          titulo="Alterar parcelas"
          texto={`Esta é a parcela ${lancamento!.parcelaNumero} de ${lancamento!.parcelaTotal}. Aplicar a alteração em quais?`}
          opcoes={[
            { texto: "Só nesta", acao: () => salvar(false) },
            { texto: "Nesta e nas próximas", acao: () => salvar(true) },
          ]}
          aoFechar={() => setPergunta(null)}
        />
      )}

      {pergunta === "excluir" && (
        <Confirmar
          titulo="Excluir lançamento"
          texto={
            ehParcela
              ? `Esta é a parcela ${lancamento!.parcelaNumero} de ${lancamento!.parcelaTotal}. O que você quer excluir?`
              : `Excluir \u201c${lancamento!.descricao}\u201d? Isso não pode ser desfeito.`
          }
          opcoes={
            ehParcela
              ? [
                  { texto: "Só esta parcela", perigo: true, acao: () => excluir(false) },
                  { texto: "Esta e as próximas", perigo: true, acao: () => excluir(true) },
                ]
              : [{ texto: "Excluir", perigo: true, acao: () => excluir(false) }]
          }
          aoFechar={() => setPergunta(null)}
        />
      )}
    </Modal>
  );
}
