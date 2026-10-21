"use client";

import { useLayoutEffect, useRef } from "react";
import { corTextoContraste } from "@/utils/cores";

/**
 * Balão que aparece acima de um segmento de barra.
 * Deve ficar dentro de um wrapper `relative` que NÃO tenha overflow-hidden,
 * para não ser cortado. `centroPct` é o centro do segmento, em % da largura do wrapper.
 * É só visual (aria-hidden): o texto deve estar também no aria-label do segmento.
 */
export function TooltipBarra({
  texto,
  cor,
  corTexto,
  centroPct,
}: {
  texto: string;
  cor: string;
  corTexto?: string;
  centroPct: number;
}) {
  const balaoRef = useRef<HTMLSpanElement>(null);

  // Mede o balão e o wrapper e prende o balão dentro do wrapper (left entre 0 e largura - balão).
  useLayoutEffect(() => {
    const balao = balaoRef.current;
    const wrapper = balao?.parentElement;
    if (!balao || !wrapper) return;
    function posicionar() {
      if (!balao || !wrapper) return;
      const larguraWrapper = wrapper.getBoundingClientRect().width;
      const larguraBalao = balao.getBoundingClientRect().width;
      const desejado = (centroPct / 100) * larguraWrapper - larguraBalao / 2;
      const left = Math.max(0, Math.min(desejado, larguraWrapper - larguraBalao));
      balao.style.left = `${left}px`;
      balao.style.visibility = "visible";
    }
    posicionar();
    window.addEventListener("resize", posicionar);
    return () => window.removeEventListener("resize", posicionar);
  }, [centroPct, texto]);

  return (
    <span
      ref={balaoRef}
      aria-hidden
      className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 max-w-[calc(100vw-2rem)] truncate whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-semibold shadow-md"
      // Fica invisível até a primeira medição, para não piscar na posição errada.
      style={{ visibility: "hidden", background: cor, color: corTexto ?? corTextoContraste(cor) }}
    >
      {texto}
    </span>
  );
}
