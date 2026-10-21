"use client";

import { MessageCircle, Repeat } from "lucide-react";
import { ILancamento } from "@/services/tipos";
import { formatarDinheiro } from "@/utils/dinheiro";
import { IconeCategoria } from "./Icone";
import { ROTULO_FORMA } from "./rotulos";

export function ItemLancamento({ lancamento: l, aoClicar }: { lancamento: ILancamento; aoClicar?: () => void }) {
  const entrada = l.tipo === "ENTRADA";
  const detalhes = [
    entrada ? "Entrada" : l.categoria?.nome,
    l.cartao ? l.cartao.nome : ROTULO_FORMA[l.formaPagamento],
    l.parcelaTotal && !l.descricao.includes(`(${l.parcelaNumero}/${l.parcelaTotal})`) ? `${l.parcelaNumero}/${l.parcelaTotal}` : null,
  ].filter(Boolean);

  return (
    <li>
      <button
        type="button"
        onClick={aoClicar}
        className="flex w-full items-center gap-3.5 rounded-lg px-1 py-3 text-left hover:bg-papel/60 cursor-pointer"
      >
        {entrada ? (
          <IconeCategoria nome="wallet" cor="#795064" />
        ) : (
          <IconeCategoria nome={l.categoria?.icone ?? "package"} cor={l.categoria?.cor ?? "#8A9A95"} />
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-medium">{l.descricao}</span>
            {l.origem === "WHATSAPP" && (
              <MessageCircle size={14} className="shrink-0 text-dinheiro" aria-label="Anotado pelo WhatsApp" />
            )}
            {l.origem === "RECORRENCIA" && <Repeat size={13} className="shrink-0 text-mudo" aria-label="Gasto fixo" />}
          </span>
          <span className="flex items-center gap-2 text-sm text-mudo">
            <span className="truncate">{detalhes.join(" · ")}</span>
            {!l.revisado && (
              <span className="shrink-0 rounded-md bg-atencao-suave px-1.5 py-0.5 text-xs font-semibold text-atencao">Revisar</span>
            )}
          </span>
        </span>
        <span className={`num shrink-0 font-display text-[1.2rem] leading-none ${entrada ? "text-dinheiro" : ""}`}>
          {entrada ? "+ " : "− "}
          {formatarDinheiro(l.valorCentavos)}
        </span>
      </button>
    </li>
  );
}
