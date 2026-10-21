"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CreditCard, Ellipsis, Inbox, List, LogOut, Plus, Repeat, Settings, Tags, Wallet, type LucideIcon } from "lucide-react";
import { useApp } from "@/contexts/app";
import { useAutenticacao } from "@/contexts/autenticacao";
import { Modal } from "@/shared/components/Modal";

interface IItem {
  href: string;
  texto: string;
  icone: LucideIcon;
}

const PRINCIPAIS: IItem[] = [
  { href: "/painel", texto: "Painel", icone: Wallet },
  { href: "/lancamentos", texto: "Lançamentos", icone: List },
  { href: "/cartoes", texto: "Cartões", icone: CreditCard },
];

const SECUNDARIOS: IItem[] = [
  { href: "/pendencias", texto: "Pendências", icone: Inbox },
  { href: "/fixos", texto: "Gastos fixos", icone: Repeat },
  { href: "/categorias", texto: "Categorias", icone: Tags },
  { href: "/configuracoes", texto: "Configurações", icone: Settings },
];

function ativo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navegacao() {
  const pathname = usePathname();
  const { abrirNovoLancamento } = useApp();
  const { sair } = useAutenticacao();
  const [maisAberto, setMaisAberto] = useState(false);

  return (
    <>
      {/* Desktop: barra lateral */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-cofre px-5 py-8 text-cofre-tinta md:flex">
        <Link href="/painel" className="mb-10 px-3 font-display text-[1.7rem] leading-none">
          Meu Salário
          <span className="mt-3 block h-px w-8 bg-latao" />
        </Link>
        <button
          onClick={() => abrirNovoLancamento()}
          className="mb-8 flex items-center justify-center gap-2 rounded-full border border-latao/70 px-4 py-2.5 text-sm font-semibold text-cofre-tinta hover:bg-latao/15 cursor-pointer"
        >
          <Plus size={17} strokeWidth={1.75} /> Novo lançamento
        </button>
        <nav className="flex flex-col gap-1">
          {[...PRINCIPAIS, ...SECUNDARIOS].map((i) => (
            <LinkNav key={i.href} item={i} ativo={ativo(pathname, i.href)} escuro />
          ))}
        </nav>
        <button onClick={sair} className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-cofre-mudo hover:text-cofre-tinta cursor-pointer">
          <LogOut size={17} strokeWidth={1.6} /> Sair
        </button>
      </aside>

      {/* Celular: barra inferior */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-linha bg-superficie/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        {PRINCIPAIS.slice(0, 2).map((i) => (
          <AbaInferior key={i.href} item={i} ativo={ativo(pathname, i.href)} />
        ))}
        <div className="grid place-items-center">
          <button
            onClick={() => abrirNovoLancamento()}
            aria-label="Novo lançamento"
            className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-cofre text-cofre-tinta shadow-[0_8px_24px_-8px_rgba(121,80,100,0.55)] ring-1 ring-latao/60 cursor-pointer"
          >
            <Plus size={24} strokeWidth={1.6} />
          </button>
        </div>
        <AbaInferior item={PRINCIPAIS[2]} ativo={ativo(pathname, PRINCIPAIS[2].href)} />
        <button
          onClick={() => setMaisAberto(true)}
          className={`flex flex-col items-center gap-1 py-2.5 text-[0.68rem] font-medium cursor-pointer ${
            SECUNDARIOS.some((i) => ativo(pathname, i.href)) ? "text-tinta" : "text-mudo"
          }`}
        >
          <Ellipsis size={21} strokeWidth={1.6} />
          Mais
        </button>
      </nav>

      {maisAberto && (
        <Modal titulo="Mais" aoFechar={() => setMaisAberto(false)}>
          <nav className="flex flex-col gap-1" onClick={() => setMaisAberto(false)}>
            {SECUNDARIOS.map((i) => (
              <LinkNav key={i.href} item={i} ativo={ativo(pathname, i.href)} />
            ))}
            <button onClick={sair} className="flex items-center gap-3 rounded-lg px-3 py-3 text-mudo hover:bg-papel cursor-pointer">
              <LogOut size={19} strokeWidth={1.6} /> Sair
            </button>
          </nav>
        </Modal>
      )}
    </>
  );
}

function LinkNav({ item, ativo, escuro = false }: { item: IItem; ativo: boolean; escuro?: boolean }) {
  const Icone = item.icone;
  const cores = escuro
    ? ativo
      ? "bg-white/[0.07] text-cofre-tinta"
      : "text-cofre-mudo hover:text-cofre-tinta"
    : ativo
      ? "bg-dinheiro-suave text-tinta"
      : "text-tinta hover:bg-papel";
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.93rem] font-medium ${cores}`}
    >
      {ativo && escuro && <span aria-hidden className="absolute -left-5 top-2 bottom-2 w-[2px] bg-latao" />}
      <Icone size={19} strokeWidth={1.6} /> {item.texto}
    </Link>
  );
}

function AbaInferior({ item, ativo }: { item: IItem; ativo: boolean }) {
  const Icone = item.icone;
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={`relative flex flex-col items-center gap-1 py-2.5 text-[0.68rem] font-medium ${ativo ? "text-tinta" : "text-mudo"}`}
    >
      {ativo && <span aria-hidden className="absolute top-0 h-[2px] w-6 bg-latao" />}
      <Icone size={21} strokeWidth={1.6} />
      {item.texto}
    </Link>
  );
}
