"use client";

import React from "react";

type VarianteBotao = "primario" | "secundario" | "fantasma" | "perigo";

const estilosBotao: Record<VarianteBotao, string> = {
  primario: "bg-dinheiro text-sobre-dinheiro hover:brightness-110",
  secundario: "bg-transparent text-tinta border border-linha hover:border-tinta/40",
  fantasma: "text-dinheiro hover:bg-dinheiro-suave/70",
  perigo: "bg-alerta text-white hover:brightness-110",
};

export function Botao({
  variante = "primario",
  className = "",
  carregando = false,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteBotao; carregando?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || carregando}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.9rem] font-semibold tracking-[0.01em] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${estilosBotao[variante]} ${className}`}
    >
      {carregando ? "Salvando…" : children}
    </button>
  );
}

/** Bloco de conteúdo do painel. Borda fina, sem sombra. */
export function Bloco({
  titulo,
  acao,
  children,
  className = "",
}: {
  titulo?: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-linha bg-superficie p-5 md:p-6 ${className}`}>
      {(titulo || acao) && (
        <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-linha pb-3">
          {titulo && <h2 className="font-display text-[1.45rem] leading-tight">{titulo}</h2>}
          {acao}
        </div>
      )}
      {children}
    </section>
  );
}

export function TituloPagina({ children, lado }: { children: React.ReactNode; lado?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h1 className="font-display text-[2.6rem] leading-none md:text-5xl">{children}</h1>
      {lado}
    </div>
  );
}

export function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-mudo">
      {rotulo}
      {children}
      {dica && <span className="text-xs font-normal">{dica}</span>}
    </label>
  );
}

const estiloEntrada =
  "w-full rounded-lg border border-linha bg-superficie-2 px-3.5 py-2.5 text-base text-tinta placeholder:text-mudo/60 focus:border-latao focus:outline-none";

export function Entrada(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${estiloEntrada} ${props.className ?? ""}`} />;
}

export function Selecao(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${estiloEntrada} ${props.className ?? ""}`} />;
}

/** Botões tipo "chip" para escolher uma opção entre poucas. */
export function Chips<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
}: {
  opcoes: { valor: T; texto: string }[];
  valor: T | null;
  aoMudar: (v: T) => void;
  rotulo: string;
}) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="flex flex-wrap gap-2">
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => aoMudar(o.valor)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition cursor-pointer ${
              ativo ? "border-dinheiro bg-dinheiro text-sobre-dinheiro" : "border-linha bg-transparent text-tinta hover:border-tinta/40"
            }`}
          >
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}

export function Alternador<T extends string>({
  opcoes,
  valor,
  aoMudar,
}: {
  opcoes: { valor: T; texto: string }[];
  valor: T;
  aoMudar: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-linha p-1">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={o.valor === valor}
          onClick={() => aoMudar(o.valor)}
          className={`rounded-full px-5 py-1.5 text-sm font-semibold transition cursor-pointer ${
            o.valor === valor ? "bg-tinta text-papel" : "text-mudo"
          }`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

export function BarraProgresso({ valor, cor, alerta }: { valor: number; cor?: string; alerta?: boolean }) {
  const pct = Math.max(0, Math.min(100, valor));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-linha/70">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, background: alerta ? "var(--alerta)" : cor ?? "var(--dinheiro)" }}
      />
    </div>
  );
}

export function Esqueleto({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-linha/60 ${className}`} />;
}

export function Vazio({ texto, acao }: { texto: string; acao?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 py-6">
      <p className="text-mudo">{texto}</p>
      {acao}
    </div>
  );
}

export function ErroCarregar({ mensagem, tentar }: { mensagem: string; tentar: () => void }) {
  return (
    <div className="rounded-xl border border-alerta/30 bg-alerta-suave p-4 text-sm">
      <p className="mb-3 text-tinta">{mensagem}</p>
      <Botao variante="secundario" onClick={tentar}>
        Tentar de novo
      </Botao>
    </div>
  );
}

export function MensagemErro({ texto }: { texto: string | null }) {
  if (!texto) return null;
  return (
    <p role="alert" className="text-sm text-alerta">
      {texto}
    </p>
  );
}
