"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  titulo,
  aoFechar,
  children,
  largura = "max-w-lg",
}: {
  titulo: string;
  aoFechar: () => void;
  children: React.ReactNode;
  largura?: string;
}) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    document.addEventListener("keydown", tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = overflow;
    };
  }, [aoFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#3b2531]/45 backdrop-blur-[2px] md:items-center md:px-4"
      onClick={aoFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-superficie p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:rounded-3xl md:p-6 ${largura}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-[1.75rem] leading-none">{titulo}</h3>
          <button onClick={aoFechar} aria-label="Fechar" className="rounded-lg p-1.5 text-mudo hover:bg-papel cursor-pointer">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Confirmação simples. Use `opcoes` para perguntas com mais de uma saída. */
export function Confirmar({
  titulo,
  texto,
  opcoes,
  aoFechar,
}: {
  titulo: string;
  texto: string;
  opcoes: { texto: string; perigo?: boolean; acao: () => void }[];
  aoFechar: () => void;
}) {
  return (
    <Modal titulo={titulo} aoFechar={aoFechar} largura="max-w-sm">
      <p className="mb-5 text-mudo">{texto}</p>
      <div className="flex flex-col gap-2">
        {opcoes.map((o) => (
          <button
            key={o.texto}
            onClick={o.acao}
            className={`rounded-full px-5 py-2.5 font-semibold cursor-pointer ${
              o.perigo ? "bg-alerta text-white" : "border border-linha bg-superficie text-tinta hover:bg-superficie-2"
            }`}
          >
            {o.texto}
          </button>
        ))}
        <button onClick={aoFechar} className="px-4 py-2 text-sm font-semibold text-mudo cursor-pointer">
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
