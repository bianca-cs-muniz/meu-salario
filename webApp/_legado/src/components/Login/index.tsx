"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAutenticacao } from "@/contexts/autenticacao";
import { Botao, Campo, Entrada, MensagemErro } from "@/shared/components/ui";

export function Login() {
  const { entrar } = useAutenticacao();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      router.replace("/painel");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaPublica titulo="Entrar" subtitulo="Veja quanto do salário ainda sobra este mês.">
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Campo rotulo="E-mail">
          <Entrada type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Campo>
        <Campo rotulo="Senha">
          <Entrada type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
        </Campo>
        <MensagemErro texto={erro} />
        <Botao type="submit" carregando={enviando}>
          Entrar
        </Botao>
      </form>
      <p className="mt-6 text-sm text-mudo">
        Ainda não tem conta?{" "}
        <Link href="/registrar" className="font-semibold text-tinta underline decoration-latao underline-offset-4">
          Criar conta
        </Link>
      </p>
    </TelaPublica>
  );
}

export function TelaPublica({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-papel px-5 py-10">
      <div className="w-full max-w-sm">
        <p className="mb-14 font-display text-2xl leading-none">
          Meu Salário
          <span className="mt-3 block h-px w-8 bg-latao" />
        </p>
        <h1 className="font-display text-6xl leading-none">{titulo}</h1>
        <p className="mb-10 mt-4 text-mudo">{subtitulo}</p>
        {children}
      </div>
    </main>
  );
}
