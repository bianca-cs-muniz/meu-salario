/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { competenciaAtual, somarMeses } from '@utils/datas';

export interface ICompetenciaContextValue {
  /** Mês selecionado, "AAAA-MM". */
  competencia: string;
  definirCompetencia: (c: string) => void;
  mesAnterior: () => void;
  mesSeguinte: () => void;
}

export const CompetenciaContext = createContext<ICompetenciaContextValue | undefined>(undefined);

/** Mês selecionado, compartilhado entre Painel, Lançamentos e Categorias. */
export const CompetenciaProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [competencia, setCompetencia] = useState(competenciaAtual);

  const valor = useMemo<ICompetenciaContextValue>(
    () => ({
      competencia,
      definirCompetencia: setCompetencia,
      mesAnterior: () => setCompetencia((c) => somarMeses(c, -1)),
      mesSeguinte: () => setCompetencia((c) => somarMeses(c, 1)),
    }),
    [competencia],
  );

  return <CompetenciaContext.Provider value={valor}>{children}</CompetenciaContext.Provider>;
};
