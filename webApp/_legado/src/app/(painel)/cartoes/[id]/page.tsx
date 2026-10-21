"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Fatura } from "@/components/Fatura";

function Conteudo({ id }: { id: string }) {
  const params = useSearchParams();
  return <Fatura cartaoId={id} competenciaInicial={params.get("competencia") ?? undefined} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <Conteudo id={id} />
    </Suspense>
  );
}
