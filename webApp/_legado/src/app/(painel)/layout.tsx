"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAutenticacao } from "@/contexts/autenticacao";
import { AppProvider } from "@/contexts/app";
import { Navegacao } from "@/components/Layout/Navegacao";
import { FormLancamento } from "@/shared/components/FormLancamento";
import { Toasts } from "@/shared/components/Toasts";
import { Botao } from "@/shared/components/ui";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const { usuario, carregando, semConexao, tentarDeNovo } = useAutenticacao();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !usuario && !semConexao) router.replace("/login");
  }, [carregando, usuario, semConexao, router]);

  if (!carregando && semConexao) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-papel px-6">
        <div className="max-w-sm">
          <h1 className="mb-2 font-display text-2xl font-bold">Sem conexão com o servidor</h1>
          <p className="mb-5 text-mudo">Seus dados estão salvos. Verifique a internet ou se a API está rodando e tente de novo.</p>
          <Botao onClick={tentarDeNovo}>Tentar de novo</Botao>
        </div>
      </main>
    );
  }

  if (carregando || !usuario) return <div className="min-h-screen bg-papel" />;

  return (
    <AppProvider>
      <div className="flex min-h-screen bg-papel">
        <Navegacao />
        <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 pb-28 pt-[calc(1.5rem+env(safe-area-inset-top))] md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>
      <FormLancamento />
      <Toasts />
    </AppProvider>
  );
}
