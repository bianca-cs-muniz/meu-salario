"use client";

// Estado compartilhado entre as telas do painel:
// - mês selecionado (competência)
// - "versão" dos dados: muda sempre que algo é salvo, e as telas recarregam
// - abrir o formulário de lançamento de qualquer lugar (botão + da navegação)
// - toasts

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { competenciaAtual, somarMeses } from "@/utils/datas";
import { ILancamento, TipoLancamento } from "@/services/tipos";

interface IToast {
  id: number;
  texto: string;
  tipo: "ok" | "erro";
}

interface IFormAberto {
  lancamento?: ILancamento;
  tipoInicial?: TipoLancamento;
}

interface IAppContexto {
  competencia: string;
  definirCompetencia: (c: string) => void;
  mesAnterior: () => void;
  mesSeguinte: () => void;

  versao: number;
  avisarMudanca: () => void;

  formAberto: IFormAberto | null;
  abrirNovoLancamento: (tipo?: TipoLancamento) => void;
  abrirEdicao: (lancamento: ILancamento) => void;
  fecharForm: () => void;

  toasts: IToast[];
  mostrarToast: (texto: string, tipo?: "ok" | "erro") => void;
}

const AppContext = createContext<IAppContexto | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [competencia, setCompetencia] = useState(competenciaAtual);
  const [versao, setVersao] = useState(0);
  const [formAberto, setFormAberto] = useState<IFormAberto | null>(null);
  const [toasts, setToasts] = useState<IToast[]>([]);
  const proximoId = useRef(1);

  const mostrarToast = useCallback((texto: string, tipo: "ok" | "erro" = "ok") => {
    const id = proximoId.current++;
    setToasts((t) => [...t, { id, texto, tipo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const valor = useMemo<IAppContexto>(
    () => ({
      competencia,
      definirCompetencia: setCompetencia,
      mesAnterior: () => setCompetencia((c) => somarMeses(c, -1)),
      mesSeguinte: () => setCompetencia((c) => somarMeses(c, 1)),
      versao,
      avisarMudanca: () => setVersao((v) => v + 1),
      formAberto,
      abrirNovoLancamento: (tipoInicial) => setFormAberto({ tipoInicial }),
      abrirEdicao: (lancamento) => setFormAberto({ lancamento }),
      fecharForm: () => setFormAberto(null),
      toasts,
      mostrarToast,
    }),
    [competencia, versao, formAberto, toasts, mostrarToast],
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de <AppProvider>");
  return ctx;
}
