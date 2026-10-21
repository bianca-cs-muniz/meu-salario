"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useApp } from "@/contexts/app";
import { useDados } from "@/hooks/useDados";
import LancamentosService from "@/services/lancamentos/lancamentos.service";
import { ILancamento } from "@/services/tipos";
import { Botao, ErroCarregar, Esqueleto, TituloPagina, Vazio } from "@/shared/components/ui";
import { Confirmar } from "@/shared/components/Modal";
import { IconeCategoria } from "@/shared/components/Icone";
import { ROTULO_FORMA } from "@/shared/components/rotulos";
import { formatarDinheiro } from "@/utils/dinheiro";
import { rotuloDia } from "@/utils/datas";

export function Pendencias() {
  const { abrirEdicao, avisarMudanca, mostrarToast } = useApp();
  const { dados, carregando, erro, recarregar } = useDados(() => LancamentosService.listar({ revisado: false }), []);
  const [excluindo, setExcluindo] = useState<ILancamento | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function aprovar(ids: string[]) {
    setOcupado(true);
    try {
      await Promise.all(ids.map((id) => LancamentosService.revisar(id)));
      mostrarToast(ids.length > 1 ? `${ids.length} lançamentos aprovados` : "Lançamento aprovado");
      avisarMudanca();
    } catch (e) {
      mostrarToast(e instanceof Error ? e.message : "Não foi possível aprovar.", "erro");
    } finally {
      setOcupado(false);
    }
  }

  async function excluir(l: ILancamento) {
    setExcluindo(null);
    try {
      await LancamentosService.excluir(l.id, !!l.grupoParcelaId);
      mostrarToast("Lançamento excluído");
      avisarMudanca();
    } catch (e) {
      mostrarToast(e instanceof Error ? e.message : "Não foi possível excluir.", "erro");
    }
  }

  const itens = dados ?? [];

  return (
    <div>
      <TituloPagina
        lado={
          itens.length > 1 && (
            <Botao variante="secundario" carregando={ocupado} onClick={() => aprovar(itens.map((l) => l.id))}>
              Aprovar todos
            </Botao>
          )
        }
      >
        Pendências
      </TituloPagina>
      <p className="-mt-3 mb-6 text-mudo">O que o estagiário anotou pelo WhatsApp e deixou para você conferir.</p>

      {erro ? (
        <ErroCarregar mensagem={erro} tentar={recarregar} />
      ) : carregando && !dados ? (
        <div className="flex flex-col gap-3">
          <Esqueleto className="h-32" />
          <Esqueleto className="h-32" />
        </div>
      ) : itens.length === 0 ? (
        <Vazio texto="Nada para revisar. O estagiário está em dia." />
      ) : (
        <ul className="flex flex-col gap-3">
          {itens.map((l) => (
            <li key={l.id} className="rounded-xl border border-linha bg-superficie p-4">
              <div className="flex items-start gap-3">
                <IconeCategoria nome={l.categoria?.icone ?? "package"} cor={l.categoria?.cor ?? "#8A9A95"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate font-semibold">{l.descricao}</p>
                    <p className="num shrink-0 font-semibold">{formatarDinheiro(l.valorCentavos)}</p>
                  </div>
                  <p className="text-sm text-mudo">
                    {[l.categoria?.nome, l.cartao?.nome ?? ROTULO_FORMA[l.formaPagamento], rotuloDia(l.data)].filter(Boolean).join(" · ")}
                  </p>
                  {l.observacao && (
                    <p className="mt-2 flex gap-2 rounded-xl bg-papel px-3 py-2 text-sm">
                      <MessageCircle size={16} className="mt-0.5 shrink-0 text-dinheiro" />
                      {l.observacao}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 sm:justify-end">
                <Botao variante="fantasma" className="text-alerta hover:bg-alerta-suave" onClick={() => setExcluindo(l)}>
                  Excluir
                </Botao>
                <Botao variante="secundario" onClick={() => abrirEdicao(l)}>
                  Corrigir
                </Botao>
                <Botao onClick={() => aprovar([l.id])} disabled={ocupado}>
                  Aprovar
                </Botao>
              </div>
            </li>
          ))}
        </ul>
      )}

      {excluindo && (
        <Confirmar
          titulo="Excluir lançamento"
          texto={`Excluir \u201c${excluindo.descricao}\u201d${excluindo.grupoParcelaId ? " e todas as parcelas seguintes" : ""}?`}
          opcoes={[{ texto: "Excluir", perigo: true, acao: () => excluir(excluindo) }]}
          aoFechar={() => setExcluindo(null)}
        />
      )}
    </div>
  );
}
