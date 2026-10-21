"use client";

import React, { useState } from "react";
import { centavosParaTexto, textoParaCentavos } from "@/utils/dinheiro";

/**
 * Campo de valor em reais. A pessoa digita "45,90" e o componente
 * devolve 4590 (centavos) em `aoMudar`, ou null se o texto não for um valor.
 */
export function CampoDinheiro({
  valor,
  aoMudar,
  grande = false,
  autoFocus,
  id,
  rotuloAcessivel,
}: {
  valor: number | null;
  aoMudar: (centavos: number | null) => void;
  grande?: boolean;
  autoFocus?: boolean;
  id?: string;
  rotuloAcessivel?: string;
}) {
  const [texto, setTexto] = useState(valor != null ? centavosParaTexto(valor) : "");

  // Sincroniza quando o valor muda de fora (ex.: abrir edição).
  const [valorAnterior, setValorAnterior] = useState(valor);
  if (valor !== valorAnterior) {
    setValorAnterior(valor);
    if (valor != null && textoParaCentavos(texto) !== valor) setTexto(centavosParaTexto(valor));
  }

  return (
    <div
      className={`flex items-baseline gap-2 border-linha focus-within:border-latao ${
        grande ? "border-b pb-2" : "rounded-lg border bg-superficie-2 px-3.5 py-2.5"
      }`}
    >
      <span className={`text-mudo ${grande ? "font-display text-3xl" : "text-base"}`}>R$</span>
      <input
        id={id}
        aria-label={rotuloAcessivel}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0,00"
        autoFocus={autoFocus}
        value={texto}
        onChange={(e) => {
          const limpo = e.target.value.replace(/[^\d.,]/g, "");
          setTexto(limpo);
          aoMudar(textoParaCentavos(limpo));
        }}
        className={`num w-full min-w-0 bg-transparent text-tinta placeholder:text-mudo/50 focus:outline-none ${
          grande ? "font-display text-6xl leading-none" : "text-base"
        }`}
      />
    </div>
  );
}
