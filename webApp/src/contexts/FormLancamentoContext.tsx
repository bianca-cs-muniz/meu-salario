/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import type { FC, ReactNode } from 'react';
import type { ILancamento, TipoLancamento } from '@services/tipos';

export interface IFormAberto {
  lancamento?: ILancamento;
  tipoInicial?: TipoLancamento;
}

interface IFormLancamentoContextValue {
  formAberto: IFormAberto | null;
  abrirNovoLancamento: (tipo?: TipoLancamento) => void;
  abrirEdicao: (lancamento: ILancamento) => void;
  fecharForm: () => void;
}

const FormLancamentoContext = createContext<IFormLancamentoContextValue | undefined>(undefined);

/** Abre o formulário de lançamento de qualquer lugar. O modal é renderizado pelo layout (features/navegacao). */
export const FormLancamentoProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [formAberto, setFormAberto] = useState<IFormAberto | null>(null);

  const valor = useMemo<IFormLancamentoContextValue>(
    () => ({
      formAberto,
      abrirNovoLancamento: (tipoInicial) => setFormAberto({ tipoInicial }),
      abrirEdicao: (lancamento) => setFormAberto({ lancamento }),
      fecharForm: () => setFormAberto(null),
    }),
    [formAberto],
  );

  return <FormLancamentoContext.Provider value={valor}>{children}</FormLancamentoContext.Provider>;
};

export const useFormLancamento = () => {
  const ctx = useContext(FormLancamentoContext);
  if (!ctx) throw new Error('useFormLancamento deve ser usado dentro de <FormLancamentoProvider>');
  return ctx;
};
