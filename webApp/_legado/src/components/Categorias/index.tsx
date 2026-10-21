"use client";

import { useState } from "react";
import { useApp } from "@/contexts/app";
import { useCompetencia } from "@/hooks/useCompetencia";
import { useDados } from "@/hooks/useDados";
import CategoriasService, { ISalvarCategoria } from "@/services/categorias/categorias.service";
import { GrupoCategoria, ICategoria } from "@/services/tipos";
import { BarraProgresso, Botao, Campo, Chips, Entrada, ErroCarregar, Esqueleto, MensagemErro, TituloPagina } from "@/shared/components/ui";
import { Modal } from "@/shared/components/Modal";
import { CampoDinheiro } from "@/shared/components/CampoDinheiro";
import { Icone, IconeCategoria, ICONES } from "@/shared/components/Icone";
import { SeletorMes } from "@/shared/components/SeletorMes";
import { ROTULO_GRUPO } from "@/shared/components/rotulos";
import { formatarDinheiro, porcentagem } from "@/utils/dinheiro";

const CORES = ["#B5869C", "#C97896", "#E39DB5", "#9C7BA8", "#6F6A9E", "#7C93B0", "#5E8C7E", "#8FA58A", "#C9A27A", "#E2A86B", "#D9826F", "#A8979F"];
const GRUPOS: GrupoCategoria[] = ["ESSENCIAL", "DESEJO", "POUPANCA"];

export function Categorias() {
  const { competencia } = useCompetencia();
  const { dados, carregando, erro, recarregar } = useDados(() => CategoriasService.listar(competencia), [competencia]);
  const [editando, setEditando] = useState<ICategoria | "nova" | null>(null);
  const [mostrarInativas, setMostrarInativas] = useState(false);

  const lista = (dados ?? []).filter((c) => mostrarInativas || c.ativa);

  return (
    <div>
      <TituloPagina lado={<Botao onClick={() => setEditando("nova")}>Nova categoria</Botao>}>Categorias</TituloPagina>
      <div className="mb-6">
        <SeletorMes />
      </div>

      {erro ? (
        <ErroCarregar mensagem={erro} tentar={recarregar} />
      ) : carregando && !dados ? (
        <Esqueleto className="h-96" />
      ) : (
        <>
          {GRUPOS.map((g) => {
            const doGrupo = lista.filter((c) => c.grupo === g);
            if (!doGrupo.length) return null;
            return (
              <section key={g} className="mb-6 rounded-xl border border-linha bg-superficie p-5 md:p-6">
                <h2 className="mb-2 border-b border-linha pb-3 font-display text-[1.45rem] leading-tight">{ROTULO_GRUPO[g]}</h2>
                <ul className="flex flex-col">
                  {doGrupo.map((c) => {
                    const passou = !!c.limiteMensalCentavos && c.gastoCentavos > c.limiteMensalCentavos;
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => setEditando(c)}
                          className={`flex w-full items-center gap-3 rounded-xl px-1 py-2.5 text-left hover:bg-papel/70 cursor-pointer ${c.ativa ? "" : "opacity-50"}`}
                        >
                          <IconeCategoria nome={c.icone} cor={c.cor} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-baseline justify-between gap-2">
                              <span className="truncate font-semibold">
                                {c.nome}
                                {c.aceitaVr && <span className="ml-2 rounded-md bg-dinheiro-suave px-1.5 py-0.5 text-xs text-dinheiro">VR</span>}
                              </span>
                              <span className={`num shrink-0 text-sm ${passou ? "font-semibold text-alerta" : "text-mudo"}`}>
                                {formatarDinheiro(c.gastoCentavos)}
                              </span>
                            </span>
                            {c.limiteMensalCentavos ? (
                              <span className="mt-1.5 flex items-center gap-3">
                                <BarraProgresso valor={porcentagem(c.gastoCentavos, c.limiteMensalCentavos)} cor={c.cor} alerta={passou} />
                                <span className="num shrink-0 text-xs text-mudo">limite {formatarDinheiro(c.limiteMensalCentavos)}</span>
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          {(dados ?? []).some((c) => !c.ativa) && (
            <button onClick={() => setMostrarInativas((v) => !v)} className="text-sm font-semibold text-dinheiro cursor-pointer">
              {mostrarInativas ? "Esconder desativadas" : "Mostrar desativadas"}
            </button>
          )}
        </>
      )}

      {editando && <FormCategoria categoria={editando === "nova" ? undefined : editando} aoFechar={() => setEditando(null)} />}
    </div>
  );
}

function FormCategoria({ categoria, aoFechar }: { categoria?: ICategoria; aoFechar: () => void }) {
  const { avisarMudanca, mostrarToast } = useApp();
  const [form, setForm] = useState<ISalvarCategoria>({
    nome: categoria?.nome ?? "",
    icone: categoria?.icone ?? "package",
    cor: categoria?.cor ?? CORES[0],
    grupo: categoria?.grupo ?? "DESEJO",
    limiteMensalCentavos: categoria?.limiteMensalCentavos ?? null,
    aceitaVr: categoria?.aceitaVr ?? false,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(dados: Partial<ISalvarCategoria>, mensagem: string) {
    if (dados.nome !== undefined && !dados.nome.trim()) return setErro("Dê um nome à categoria.");
    setErro(null);
    setSalvando(true);
    try {
      if (categoria) await CategoriasService.editar(categoria.id, dados);
      else await CategoriasService.criar({ ...form, ...dados });
      mostrarToast(mensagem);
      avisarMudanca();
      aoFechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal titulo={categoria ? "Editar categoria" : "Nova categoria"} aoFechar={aoFechar}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          salvar({ ...form, nome: form.nome.trim(), limiteMensalCentavos: form.limiteMensalCentavos || null }, categoria ? "Categoria atualizada" : "Categoria criada");
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-end gap-3">
          <IconeCategoria nome={form.icone} cor={form.cor} tamanho={46} />
          <div className="flex-1">
            <Campo rotulo="Nome">
              <Entrada value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </Campo>
          </div>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-mudo">Ícone</legend>
          <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-9">
            {Object.keys(ICONES).map((nome) => (
              <button
                key={nome}
                type="button"
                aria-label={nome}
                aria-pressed={form.icone === nome}
                onClick={() => setForm({ ...form, icone: nome })}
                className={`grid aspect-square place-items-center rounded-lg border cursor-pointer ${
                  form.icone === nome ? "border-dinheiro bg-dinheiro-suave text-dinheiro" : "border-linha text-mudo hover:text-tinta"
                }`}
              >
                <Icone nome={nome} />
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-mudo">Cor</legend>
          <div className="flex flex-wrap gap-2">
            {CORES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Cor ${c}`}
                aria-pressed={form.cor === c}
                onClick={() => setForm({ ...form, cor: c })}
                className={`h-8 w-8 rounded-full border-2 cursor-pointer ${form.cor === c ? "border-tinta" : "border-transparent"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-mudo">Grupo na regra 50/30/20</legend>
          <Chips rotulo="Grupo" opcoes={GRUPOS.map((g) => ({ valor: g, texto: ROTULO_GRUPO[g] }))} valor={form.grupo} aoMudar={(g) => setForm({ ...form, grupo: g })} />
        </fieldset>
        <Campo rotulo="Limite por mês (opcional)" dica="O estagiário avisa quando passar de 80%.">
          <CampoDinheiro valor={form.limiteMensalCentavos} aoMudar={(v) => setForm({ ...form, limiteMensalCentavos: v })} rotuloAcessivel="Limite mensal" />
        </Campo>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={form.aceitaVr} onChange={(e) => setForm({ ...form, aceitaVr: e.target.checked })} className="h-5 w-5 accent-[var(--dinheiro)]" />
          Pode ser paga com VR
        </label>
        <MensagemErro texto={erro} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {categoria ? (
            <Botao
              type="button"
              variante="fantasma"
              className={categoria.ativa ? "text-alerta hover:bg-alerta-suave" : ""}
              onClick={() => salvar({ ativa: !categoria.ativa }, categoria.ativa ? "Categoria desativada" : "Categoria reativada")}
            >
              {categoria.ativa ? "Desativar" : "Reativar"}
            </Botao>
          ) : (
            <span />
          )}
          <Botao type="submit" carregando={salvando}>
            {categoria ? "Salvar alterações" : "Criar categoria"}
          </Botao>
        </div>
      </form>
    </Modal>
  );
}
