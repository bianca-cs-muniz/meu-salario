"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAutenticacao } from "@/contexts/autenticacao";

export default function Inicio() {
  const { usuario, carregando } = useAutenticacao();
  const router = useRouter();

  useEffect(() => {
    if (!carregando) router.replace(usuario ? "/painel" : "/login");
  }, [carregando, usuario, router]);

  return <div className="min-h-screen bg-papel" />;
}
