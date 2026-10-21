import { useApp } from "@/contexts/app";

/** Mês selecionado, compartilhado entre Painel, Lançamentos e Categorias. */
export function useCompetencia() {
  const { competencia, definirCompetencia, mesAnterior, mesSeguinte } = useApp();
  return { competencia, definirCompetencia, mesAnterior, mesSeguinte };
}
