"use client";

import { useState } from "react";
import { MessageCircle, Pencil } from "lucide-react";
import { useApp } from "@/contexts/app";
import { useAutenticacao } from "@/contexts/autenticacao";
import { useDados } from "@/hooks/useDados";
import CarteirasService from "@/services/carteiras/carteiras.service";
import { ICarteira } from "@/services/tipos";
import { Bloco, Botao, Campo, Entrada, ErroCarregar, Esqueleto, MensagemErro, TituloPagina } from "@/shared/components/ui";
import { formatarDinheiro } from "@/utils/dinheiro";

const CHAVE_AVISOS = "meu-salario:avisos";

export function Configuracoes() {
  const { usuario, sair } = useAutenticacao();
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <TituloPagina>Configurações</TituloPagina>
      <Perfil />
      <WhatsApp />
      <Carteiras />
      <Avisos />
      <Bloco titulo="Conta">
        <p className="mb-4 text-sm text-mudo">Conectado como {usuario?.email}.</p>
        <Botao variante="secundario" onClick={sair}>
          Sair
        </Botao>
      </Bloco>
    </div>
  );
}

function Perfil() {
  const { usuario, atualizarPerfil } = useAutenticacao();
  const { mostrarToast } = useApp();
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return setErro("Escreva seu nome.");
    setErro(null);
    setSalvando(true);
    try {
      await atualizarPerfil({ nome: nome.trim() });
      mostrarToast("Nome atualizado");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Bloco titulo="Perfil">
      <form onSubmit={salvar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Campo rotulo="Nome">
            <Entrada value={nome} onChange={(e) => setNome(e.target.value)} />
          </Campo>
        </div>
        <Botao type="submit" variante="secundario" carregando={salvando} disabled={nome.trim() === usuario?.nome}>
          Salvar nome
        </Botao>
      </form>
      <MensagemErro texto={erro} />
    </Bloco>
  );
}

function soDigitos(t: string) {
  return t.replace(/\D/g, "");
}

function formatarTelefone(digitos: string) {
  const d = soDigitos(digitos);
  if (d.length < 12) return d;
  return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, d.length - 4)}-${d.slice(-4)}`;
}

function WhatsApp() {
  const { usuario, atualizarPerfil } = useAutenticacao();
  const { mostrarToast } = useApp();
  const vinculado = usuario?.telefoneWhatsapp ?? null;
  const [telefone, setTelefone] = useState(vinculado ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(novo: string | null) {
    if (novo !== null) {
      novo = soDigitos(novo);
      if (novo.length === 10 || novo.length === 11) novo = `55${novo}`; // sem DDI: assume Brasil
      if (novo.length < 12 || novo.length > 13) return setErro("Digite o número com DDD, por exemplo 11 99999-8888.");
    }
    setErro(null);
    setSalvando(true);
    try {
      await atualizarPerfil({ telefoneWhatsapp: novo });
      setTelefone(novo ?? "");
      mostrarToast(novo ? "WhatsApp vinculado" : "WhatsApp desvinculado");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Bloco titulo="Estagiário no WhatsApp">
      {vinculado ? (
        <p className="mb-4 flex items-center gap-2 text-sm">
          <MessageCircle size={18} className="text-dinheiro" />
          Vinculado ao número <strong className="num">{formatarTelefone(vinculado)}</strong>
        </p>
      ) : (
        <p className="mb-4 text-sm text-mudo">Vincule seu número para anotar gastos mandando mensagem, sem abrir o app.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          salvar(telefone);
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Campo rotulo="Seu número de WhatsApp">
            <Entrada inputMode="tel" placeholder="11 99999-8888" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </Campo>
        </div>
        <Botao type="submit" variante="secundario" carregando={salvando}>
          {vinculado ? "Trocar número" : "Vincular"}
        </Botao>
      </form>
      <MensagemErro texto={erro} />
      {vinculado && (
        <button onClick={() => salvar(null)} className="mt-2 text-sm font-semibold text-alerta cursor-pointer">
          Desvincular
        </button>
      )}
      <div className="mt-5 rounded-xl bg-papel p-4 text-sm">
        <p className="mb-2 font-semibold">Exemplos do que mandar</p>
        <ul className="flex flex-col gap-1.5 text-mudo">
          <li><span className="font-semibold text-tinta">mercado 230 vr</span> anota no VR</li>
          <li><span className="font-semibold text-tinta">ifood 45 cartão</span> anota no cartão</li>
          <li><span className="font-semibold text-tinta">tênis 600 em 3x</span> cria as parcelas</li>
          <li><span className="font-semibold text-tinta">quanto sobrou?</span> responde a sobra do mês</li>
          <li><span className="font-semibold text-tinta">apaga o último</span> desfaz o último registro</li>
        </ul>
      </div>
    </Bloco>
  );
}

function Carteiras() {
  const { mostrarToast, avisarMudanca } = useApp();
  const { dados, carregando, erro, recarregar } = useDados(() => CarteirasService.listar(), []);
  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState("");

  async function renomear(c: ICarteira) {
    if (!nome.trim()) return;
    try {
      await CarteirasService.editar(c.id, { nome: nome.trim() });
      mostrarToast("Carteira renomeada");
      setEditando(null);
      avisarMudanca();
    } catch (e) {
      mostrarToast(e instanceof Error ? e.message : "Não foi possível renomear.", "erro");
    }
  }

  async function criarVr() {
    try {
      await CarteirasService.criar({ nome: "VR", tipo: "VR" });
      mostrarToast("Carteira de VR criada. Cadastre o crédito mensal em Gastos fixos.");
      avisarMudanca();
    } catch (e) {
      mostrarToast(e instanceof Error ? e.message : "Não foi possível criar.", "erro");
    }
  }

  return (
    <Bloco titulo="Carteiras">
      {erro ? (
        <ErroCarregar mensagem={erro} tentar={recarregar} />
      ) : carregando && !dados ? (
        <Esqueleto className="h-24" />
      ) : (
        <ul className="flex flex-col gap-2">
          {(dados ?? []).map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-xl border border-linha px-3 py-2.5">
              {editando === c.id ? (
                <form
                  className="flex flex-1 gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    renomear(c);
                  }}
                >
                  <Entrada value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
                  <Botao type="submit" variante="secundario">
                    Salvar
                  </Botao>
                </form>
              ) : (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{c.nome}</span>
                    <span className="text-sm text-mudo">{c.tipo === "VR" ? "Saldo do VR" : "Sobra do mês"}</span>
                  </span>
                  <span className="num font-semibold">{formatarDinheiro(c.saldoCentavos)}</span>
                  <button
                    onClick={() => {
                      setEditando(c.id);
                      setNome(c.nome);
                    }}
                    aria-label={`Renomear ${c.nome}`}
                    className="rounded-lg p-2 text-mudo hover:bg-papel cursor-pointer"
                  >
                    <Pencil size={16} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {dados && !dados.some((c) => c.tipo === "VR") && (
        <Botao variante="secundario" className="mt-3" onClick={criarVr}>
          Adicionar carteira de VR
        </Botao>
      )}
    </Bloco>
  );
}

function Avisos() {
  // No MVP as preferências ficam neste navegador. Quando a API tiver o campo, mover para o perfil.
  const [avisos, setAvisos] = useState(() => {
    const padrao = { resumoSemanal: true, fatura: true };
    if (typeof window === "undefined") return padrao;
    try {
      return { ...padrao, ...JSON.parse(localStorage.getItem(CHAVE_AVISOS) ?? "{}") };
    } catch {
      return padrao;
    }
  });

  function alternar(chave: keyof typeof avisos) {
    const novo = { ...avisos, [chave]: !avisos[chave] };
    setAvisos(novo);
    try {
      localStorage.setItem(CHAVE_AVISOS, JSON.stringify(novo));
    } catch {
      /* navegador sem armazenamento */
    }
  }

  return (
    <Bloco titulo="Avisos do estagiário">
      <div className="flex flex-col gap-3">
        <Interruptor ligado={avisos.resumoSemanal} aoAlternar={() => alternar("resumoSemanal")} texto="Resumo da semana, aos domingos" />
        <Interruptor ligado={avisos.fatura} aoAlternar={() => alternar("fatura")} texto="Fatura fechando e vencendo" />
      </div>
    </Bloco>
  );
}

function Interruptor({ ligado, aoAlternar, texto }: { ligado: boolean; aoAlternar: () => void; texto: string }) {
  return (
    <button role="switch" aria-checked={ligado} onClick={aoAlternar} className="flex items-center justify-between gap-4 text-left cursor-pointer">
      <span>{texto}</span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${ligado ? "bg-dinheiro" : "bg-linha"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${ligado ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}
