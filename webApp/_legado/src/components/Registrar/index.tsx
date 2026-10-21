"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAutenticacao } from "@/contexts/autenticacao";
import { Botao, Campo, Entrada, MensagemErro } from "@/shared/components/ui";
import { TelaPublica } from "@/components/Login";

export function Registrar() {
  const { registrar } = useAutenticacao();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    setErro(null);
    setEnviando(true);
    try {
      await registrar({ nome: nome.trim(), email: email.trim(), senha });
      router.replace("/painel");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível criar a conta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaPublica titulo="Criar conta" subtitulo="Depois você informa o salário e começa a anotar.">
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Campo rotulo="Nome">
          <Entrada autoComplete="given-name" required value={nome} onChange={(e) => setNome(e.target.value)} />
        </Campo>
        <Campo rotulo="E-mail">
          <Entrada type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Campo>
        <Campo rotulo="Senha" dica="Pelo menos 6 caracteres.">
          <Entrada type="password" autoComplete="new-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
        </Campo>
        <MensagemErro texto={erro} />
        <Botao type="submit" carregando={enviando}>
          Criar conta
        </Botao>
      </form>
      <p className="mt-6 text-sm text-mudo">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-tinta underline decoration-latao underline-offset-4">
          Entrar
        </Link>
      </p>
    </TelaPublica>
  );
}
