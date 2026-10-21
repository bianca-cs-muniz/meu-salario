"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCompetencia } from "@/hooks/useCompetencia";
import { competenciaAtual, nomeMes } from "@/utils/datas";

export function SeletorMes() {
  const { competencia, mesAnterior, mesSeguinte, definirCompetencia } = useCompetencia();
  const ehAtual = competencia === competenciaAtual();

  return (
    <div className="flex items-center gap-2">
      <nav aria-label="Mês" className="flex items-center rounded-full border border-linha p-1">
        <button onClick={mesAnterior} aria-label="Mês anterior" className="grid h-8 w-8 place-items-center rounded-full hover:bg-papel cursor-pointer">
          <ChevronLeft size={18} />
        </button>
        <span className="min-w-36 text-center font-display text-lg leading-none">{nomeMes(competencia)}</span>
        <button onClick={mesSeguinte} aria-label="Próximo mês" className="grid h-8 w-8 place-items-center rounded-full hover:bg-papel cursor-pointer">
          <ChevronRight size={18} />
        </button>
      </nav>
      {!ehAtual && (
        <button onClick={() => definirCompetencia(competenciaAtual())} className="text-sm font-semibold text-latao cursor-pointer">
          Voltar para hoje
        </button>
      )}
    </div>
  );
}
