import { useContext } from 'react';
import { CompetenciaContext } from '@contexts/CompetenciaContext';

/** Mês selecionado, compartilhado entre Painel, Lançamentos e Categorias. */
export const useCompetencia = () => {
  const ctx = useContext(CompetenciaContext);
  if (!ctx) throw new Error('useCompetencia deve ser usado dentro de <CompetenciaProvider>');
  const { competencia, definirCompetencia, mesAnterior, mesSeguinte } = ctx;
  return { competencia, definirCompetencia, mesAnterior, mesSeguinte };
};
