"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AutenticacaoService, { IAtualizarPerfilDto, IRegistrarDto } from "@/services/autenticacao/autenticacao.service";
import LocalStorageService from "@/services/localStorage.service";
import { ErroHttp } from "@/services/HttpClient";
import { IUsuario } from "@/services/tipos";

interface IAutenticacaoContexto {
  usuario: IUsuario | null;
  carregando: boolean;
  /** Tem token, mas a API não respondeu (sem rede ou fora do ar). Não é motivo para deslogar. */
  semConexao: boolean;
  tentarDeNovo: () => void;
  entrar: (email: string, senha: string) => Promise<void>;
  registrar: (input: IRegistrarDto) => Promise<void>;
  sair: () => void;
  atualizarPerfil: (input: IAtualizarPerfilDto) => Promise<void>;
}

const AutenticacaoContext = createContext<IAutenticacaoContexto | undefined>(undefined);

export function AutenticacaoProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<IUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [semConexao, setSemConexao] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      if (!LocalStorageService.obterToken()) {
        if (!cancelado) setCarregando(false);
        return;
      }
      try {
        const perfil = await AutenticacaoService.perfil();
        if (cancelado) return;
        setUsuario(perfil);
        setSemConexao(false);
      } catch (e) {
        if (cancelado) return;
        // Só desloga se a API disse que o token não vale. Falha de rede mantém o login.
        if (e instanceof ErroHttp && (e.status === 401 || e.status === 403)) LocalStorageService.removerToken();
        else setSemConexao(true);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  const tentarDeNovo = useCallback(() => {
    setCarregando(true);
    setTentativa((t) => t + 1);
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const res = await AutenticacaoService.login({ email, senha });
    setUsuario(res.usuario);
    setSemConexao(false);
  }, []);

  const registrar = useCallback(async (input: IRegistrarDto) => {
    const res = await AutenticacaoService.registrar(input);
    setUsuario(res.usuario);
    setSemConexao(false);
  }, []);

  const sair = useCallback(() => {
    AutenticacaoService.sair();
    setUsuario(null);
    setSemConexao(false);
  }, []);

  const atualizarPerfil = useCallback(async (input: IAtualizarPerfilDto) => {
    setUsuario(await AutenticacaoService.atualizarPerfil(input));
  }, []);

  return (
    <AutenticacaoContext.Provider value={{ usuario, carregando, semConexao, tentarDeNovo, entrar, registrar, sair, atualizarPerfil }}>
      {children}
    </AutenticacaoContext.Provider>
  );
}

export function useAutenticacao() {
  const ctx = useContext(AutenticacaoContext);
  if (!ctx) throw new Error("useAutenticacao deve ser usado dentro de <AutenticacaoProvider>");
  return ctx;
}
