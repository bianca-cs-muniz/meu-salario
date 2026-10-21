"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/app";

interface IEstado<T> {
  chave: string | null; // qual requisição gerou estes dados
  dados: T | null;
  erro: string | null;
}

/**
 * Carrega dados da API e recarrega quando as dependências mudam
 * ou quando qualquer tela avisa que salvou algo (versao do AppContext).
 * Mantém os dados anteriores na tela enquanto a nova requisição não volta.
 */
export function useDados<T>(carregar: () => Promise<T>, deps: unknown[] = []) {
  const { versao } = useApp();
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState<IEstado<T>>({ chave: null, dados: null, erro: null });
  const chave = JSON.stringify([versao, tentativa, ...deps]);

  useEffect(() => {
    let cancelado = false;
    carregar()
      .then((dados) => !cancelado && setEstado({ chave, dados, erro: null }))
      .catch((e) => !cancelado && setEstado((s) => ({ chave, dados: s.dados, erro: e instanceof Error ? e.message : "Não foi possível carregar." })));
    return () => {
      cancelado = true;
    };
    // `carregar` muda a cada render; quem decide quando recarregar é a chave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return {
    dados: estado.dados,
    erro: estado.chave === chave ? estado.erro : null,
    carregando: estado.chave !== chave,
    recarregar: () => setTentativa((t) => t + 1),
  };
}
