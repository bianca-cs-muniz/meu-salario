"use client";

const CHAVE_TOKEN = "meu-salario:token";

class LocalStorageService {
  salvarToken = (token: string) => localStorage.setItem(CHAVE_TOKEN, token);

  obterToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CHAVE_TOKEN);
  };

  removerToken = () => localStorage.removeItem(CHAVE_TOKEN);
}

export default new LocalStorageService();
