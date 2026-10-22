import { describe, it, expect, vi } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { ClienteMensagens, ContextoModelo, Extracao, extrair, montarSistema, PROMPT_FIXO } from "./agente.extracao";
import Respostas from "./agente.respostas";

// Sem rede: o cliente da Anthropic é sempre um objeto falso.

const contexto: ContextoModelo = {
  hoje: "2026-10-22",
  diaDaSemana: "quinta-feira",
  categorias: [
    { nome: "Mercado", aceitaVr: true },
    { nome: "Transporte", aceitaVr: false },
  ],
  cartoes: ["Nubank"],
  temCarteiraVr: true,
};

const extracao: Extracao = {
  intencao: "REGISTRAR",
  lancamento: {
    tipo: "SAIDA",
    valorCentavos: 4500,
    descricao: "Mercado",
    categoriaNome: "Mercado",
    formaPagamento: "VR",
    cartaoNome: null,
    parcelas: null,
    data: null,
    duvida: null,
  },
  consulta: null,
};

function clienteQue(comportamento: () => Promise<unknown>) {
  const parse = vi.fn(comportamento);
  return { cliente: { messages: { parse } } as unknown as ClienteMensagens, parse };
}

const resposta = (extra: Record<string, unknown>) => async () => ({ stop_reason: "end_turn", parsed_output: extracao, content: [], ...extra });

describe("extrair", () => {
  it("devolve a extração quando o modelo responde", async () => {
    const { cliente, parse } = clienteQue(resposta({}));
    expect(await extrair("mercado 45 no vr", contexto, cliente)).toEqual({ ok: true, extracao });
    const params = parse.mock.calls[0][0 as never] as Record<string, any>;
    expect(params.max_tokens).toBe(2048);
    expect(params.model).toBe(process.env.ANTHROPIC_MODEL?.trim() || "claude-haiku-5-5");
    expect(params.messages).toEqual([{ role: "user", content: "mercado 45 no vr" }]);
    expect(params.output_config.effort).toBe("low");
    expect(params.output_config.format.type).toBe("json_schema");
    expect(params).not.toHaveProperty("temperature");
    expect(params).not.toHaveProperty("thinking");
  });

  it("recusa → 'Não consigo ajudar com isso'", async () => {
    const { cliente } = clienteQue(resposta({ stop_reason: "refusal", parsed_output: null }));
    expect(await extrair("x", contexto, cliente)).toEqual({ ok: false, motivo: "RECUSA", resposta: Respostas.RECUSA });
  });

  it("max_tokens → 'Não entendi'", async () => {
    const { cliente } = clienteQue(resposta({ stop_reason: "max_tokens" }));
    expect(await extrair("x", contexto, cliente)).toMatchObject({ ok: false, motivo: "NAO_ENTENDI", resposta: Respostas.NAO_ENTENDI });
  });

  it("parsed_output null → 'Não entendi'", async () => {
    const { cliente } = clienteQue(resposta({ parsed_output: null }));
    expect(await extrair("x", contexto, cliente)).toMatchObject({ ok: false, motivo: "NAO_ENTENDI" });
  });

  it("falha ao interpretar a saída → 'Não entendi'", async () => {
    const { cliente } = clienteQue(async () => {
      throw new Anthropic.AnthropicError("Failed to parse structured output");
    });
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await extrair("x", contexto, cliente)).toMatchObject({ ok: false, motivo: "NAO_ENTENDI" });
  });

  it("RateLimitError → 'Estou ocupado'", async () => {
    const { cliente } = clienteQue(async () => {
      throw new Anthropic.RateLimitError(429, undefined, "rate", new Headers());
    });
    expect(await extrair("x", contexto, cliente)).toEqual({ ok: false, motivo: "OCUPADO", resposta: Respostas.OCUPADO });
    expect(Respostas.OCUPADO).toBe("Estou ocupado, tenta em um minuto.");
  });

  it("APIConnectionError (e timeout) → 'Não consegui pensar agora'", async () => {
    for (const erro of [new Anthropic.APIConnectionError({ message: "rede" }), new Anthropic.APIConnectionTimeoutError()]) {
      const { cliente } = clienteQue(async () => {
        throw erro;
      });
      expect(await extrair("x", contexto, cliente)).toEqual({ ok: false, motivo: "SEM_CONEXAO", resposta: Respostas.SEM_CONEXAO });
    }
  });

  it("APIError → loga só status e request id", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { cliente } = clienteQue(async () => {
      throw new Anthropic.APIError(500, { segredo: "não logar" }, "mensagem com dados", new Headers({ "request-id": "req_123" }));
    });
    expect(await extrair("x", contexto, cliente)).toMatchObject({ ok: false, motivo: "ERRO_API", resposta: Respostas.SEM_CONEXAO });
    expect(log).toHaveBeenCalledWith("[telegram] erro da API do Claude", { status: 500, requestId: "req_123" });
    log.mockRestore();
  });
});

describe("montarSistema", () => {
  const sistema = montarSistema(contexto);

  it("bloco fixo (com cache_control) antes do variável (sem cache_control)", () => {
    expect(sistema).toHaveLength(2);
    expect(sistema[0]).toEqual({ type: "text", text: PROMPT_FIXO, cache_control: { type: "ephemeral" } });
    expect(sistema[1].cache_control).toBeUndefined();
    expect(sistema[1].text).toContain("Hoje: 2026-10-22 (quinta-feira)");
    expect(sistema[1].text).toContain("Mercado (aceita VR); Transporte");
    expect(sistema[1].text).toContain("Cartões de crédito: Nubank.");
    expect(sistema[1].text).toContain("Carteira VR: sim.");
  });

  it("o bloco fixo não depende do usuário nem da data", () => {
    const outro = montarSistema({ ...contexto, hoje: "2027-01-01", categorias: [], cartoes: [], temCarteiraVr: false });
    expect(outro[0].text).toBe(sistema[0].text);
    expect(PROMPT_FIXO).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it("o contexto não leva ids, e-mail nem valores", () => {
    const texto = sistema.map((b) => b.text).join("\n");
    expect(texto).not.toMatch(/@/);
    expect(texto).not.toMatch(/\bc[a-z0-9]{20,}\b/); // cuid
    // Fora a linha da data, o bloco do usuário não tem números nem valores.
    expect(sistema[1].text.split("\n").slice(1).join("\n")).not.toMatch(/R\$|\d/);
    expect(Object.keys(contexto).sort()).toEqual(["cartoes", "categorias", "diaDaSemana", "hoje", "temCarteiraVr"]);
  });

  it("sem cartões e sem VR", () => {
    const [, variavel] = montarSistema({ ...contexto, cartoes: [], temCarteiraVr: false, categorias: [] });
    expect(variavel.text).toContain("Cartões de crédito: nenhum.");
    expect(variavel.text).toContain("Carteira VR: não.");
    expect(variavel.text).toContain("Categorias: nenhuma.");
  });
});
