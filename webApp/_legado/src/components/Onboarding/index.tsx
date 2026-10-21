"use client";

import { useState } from "react";
import { useApp } from "@/contexts/app";
import { useAutenticacao } from "@/contexts/autenticacao";
import CarteirasService from "@/services/carteiras/carteiras.service";
import CartoesService from "@/services/cartoes/cartoes.service";
import GastosFixosService from "@/services/gastos-fixos/gastos-fixos.service";
import { CampoDinheiro } from "@/shared/components/CampoDinheiro";
import { Botao, Campo, Entrada, MensagemErro } from "@/shared/components/ui";

type Passo = "salario" | "vr" | "cartao";
const PASSOS: Passo[] = ["salario", "vr", "cartao"];

function diaValido(texto: string) {
  const n = Number(texto);
  return Number.isInteger(n) && n >= 1 && n <= 28;
}

export function Onboarding() {
  const { usuario } = useAutenticacao();
  const { avisarMudanca, mostrarToast } = useApp();
  const [passo, setPasso] = useState<Passo>("salario");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [salario, setSalario] = useState<number | null>(null);
  const [diaSalario, setDiaSalario] = useState("5");
  const [vr, setVr] = useState<number | null>(null);
  const [diaVr, setDiaVr] = useState("1");
  const [cartao, setCartao] = useState({ nome: "", fechamento: "", vencimento: "" });
  const [cartoesCriados, setCartoesCriados] = useState<string[]>([]);

  async function executar(acao: () => Promise<void>) {
    setErro(null);
    setSalvando(true);
    try {
      await acao();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  const salvarSalario = () =>
    executar(async () => {
      if (!salario || salario <= 0) throw new Error("Digite o valor do salário, por exemplo 3.500,00.");
      if (!diaValido(diaSalario)) throw new Error("O dia precisa ser entre 1 e 28.");
      const carteiras = await CarteirasService.listar();
      const conta = carteiras.find((c) => c.tipo === "CONTA");
      if (!conta) throw new Error("Conta principal não encontrada. Verifique se a API cria a carteira CONTA no registro.");
      await GastosFixosService.criar({
        tipo: "ENTRADA",
        descricao: "Salário",
        valorCentavos: salario,
        diaDoMes: Number(diaSalario),
        formaPagamento: "PIX",
        carteiraId: conta.id,
      });
      setPasso("vr");
    });

  const salvarVr = () =>
    executar(async () => {
      if (!vr || vr <= 0) throw new Error("Digite o valor do VR ou toque em \u201cNão recebo VR\u201d.");
      if (!diaValido(diaVr)) throw new Error("O dia precisa ser entre 1 e 28.");
      const carteira = await CarteirasService.criar({ nome: "VR", tipo: "VR" });
      await GastosFixosService.criar({
        tipo: "ENTRADA",
        descricao: "Crédito do VR",
        valorCentavos: vr,
        diaDoMes: Number(diaVr),
        formaPagamento: "VR",
        carteiraId: carteira.id,
      });
      setPasso("cartao");
    });

  const salvarCartao = (continuar: boolean) =>
    executar(async () => {
      const preenchido = cartao.nome || cartao.fechamento || cartao.vencimento;
      if (preenchido) {
        if (!cartao.nome.trim()) throw new Error("Dê um nome ao cartão, por exemplo Nubank.");
        if (!diaValido(cartao.fechamento) || !diaValido(cartao.vencimento))
          throw new Error("Os dias de fechamento e vencimento precisam ser entre 1 e 28.");
        await CartoesService.criar({
          nome: cartao.nome.trim(),
          diaFechamento: Number(cartao.fechamento),
          diaVencimento: Number(cartao.vencimento),
          limiteCentavos: null,
          cor: "#795064",
        });
        setCartoesCriados((c) => [...c, cartao.nome.trim()]);
        setCartao({ nome: "", fechamento: "", vencimento: "" });
      }
      if (!continuar) {
        mostrarToast("Tudo pronto. Agora é só anotar os gastos.");
        avisarMudanca();
      }
    });

  const indice = PASSOS.indexOf(passo);

  return (
    <div className="mx-auto max-w-lg pt-4 md:pt-12">
      <p className="mb-3 text-sm font-semibold text-mudo">
        Passo {indice + 1} de 3
      </p>
      <div className="mb-8 flex gap-1.5" aria-hidden>
        {PASSOS.map((p, i) => (
          <span key={p} className={`h-px flex-1 ${i <= indice ? "bg-latao" : "bg-linha"}`} />
        ))}
      </div>

      {passo === "salario" && (
        <section className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-5xl leading-[1.02]">
              {usuario?.nome ? `${usuario.nome.split(" ")[0]}, quanto` : "Quanto"} cai na sua conta todo mês?
            </h1>
            <p className="mt-3 text-mudo">O salário líquido. É a partir dele que o app mostra quanto ainda sobra.</p>
          </div>
          <CampoDinheiro valor={salario} aoMudar={setSalario} grande autoFocus rotuloAcessivel="Salário mensal" />
          <Campo rotulo="Em que dia do mês?">
            <Entrada inputMode="numeric" value={diaSalario} onChange={(e) => setDiaSalario(e.target.value.replace(/\D/g, ""))} className="max-w-24" />
          </Campo>
          <MensagemErro texto={erro} />
          <Botao onClick={salvarSalario} carregando={salvando}>
            Continuar
          </Botao>
        </section>
      )}

      {passo === "vr" && (
        <section className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-5xl leading-[1.02]">Você recebe vale-refeição ou alimentação?</h1>
            <p className="mt-3 text-mudo">O VR fica com saldo separado, porque só serve para comida e mercado.</p>
          </div>
          <CampoDinheiro valor={vr} aoMudar={setVr} grande autoFocus rotuloAcessivel="Valor do VR" />
          <Campo rotulo="Em que dia o VR é creditado?">
            <Entrada inputMode="numeric" value={diaVr} onChange={(e) => setDiaVr(e.target.value.replace(/\D/g, ""))} className="max-w-24" />
          </Campo>
          <MensagemErro texto={erro} />
          <div className="flex flex-col gap-2">
            <Botao onClick={salvarVr} carregando={salvando}>
              Continuar
            </Botao>
            <Botao variante="fantasma" onClick={() => setPasso("cartao")}>
              Não recebo VR
            </Botao>
          </div>
        </section>
      )}

      {passo === "cartao" && (
        <section className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-5xl leading-[1.02]">E cartão de crédito?</h1>
            <p className="mt-3 text-mudo">Com o dia de fechamento, o app sabe em qual fatura cada compra cai.</p>
          </div>
          {cartoesCriados.length > 0 && (
            <p className="rounded-xl bg-dinheiro-suave px-3 py-2 text-sm text-dinheiro">Adicionado: {cartoesCriados.join(", ")}</p>
          )}
          <Campo rotulo="Nome do cartão">
            <Entrada placeholder="Nubank, Inter…" value={cartao.nome} onChange={(e) => setCartao({ ...cartao, nome: e.target.value })} />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Dia do fechamento">
              <Entrada inputMode="numeric" value={cartao.fechamento} onChange={(e) => setCartao({ ...cartao, fechamento: e.target.value.replace(/\D/g, "") })} />
            </Campo>
            <Campo rotulo="Dia do vencimento">
              <Entrada inputMode="numeric" value={cartao.vencimento} onChange={(e) => setCartao({ ...cartao, vencimento: e.target.value.replace(/\D/g, "") })} />
            </Campo>
          </div>
          <MensagemErro texto={erro} />
          <div className="flex flex-col gap-2">
            <Botao onClick={() => salvarCartao(false)} carregando={salvando}>
              {cartao.nome ? "Salvar e terminar" : "Terminar"}
            </Botao>
            <Botao variante="secundario" onClick={() => salvarCartao(true)} disabled={!cartao.nome}>
              Salvar e adicionar outro
            </Botao>
          </div>
        </section>
      )}
    </div>
  );
}
