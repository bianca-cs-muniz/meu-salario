import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

// Sem banco e sem rede: repositórios, serviços, cliente do Telegram e extração são falsos.

// Config mutável: cada teste pode ligar/desligar o Claude (reserva).
const config = vi.hoisted(() => ({
  anthropic: { habilitado: true, modelo: "modelo-teste" },
  telegram: { habilitado: true, token: "fake", webhookSecret: "fake", botUsername: "bot" },
}));
vi.mock("@config/app.config", () => ({ default: config }));
vi.mock("../telegram.repository", () => ({
  default: {
    readPorChat: vi.fn(),
    vincular: vi.fn(),
    desvincularChat: vi.fn(async () => ({ count: 1 })),
    registrarMensagem: vi.fn(),
    readContexto: vi.fn(),
  },
}));
vi.mock("../telegram.cliente", async (original) => ({
  ...(await original<typeof import("../telegram.cliente")>()),
  default: { enviarMensagem: vi.fn(async () => undefined), digitando: vi.fn(async () => undefined) },
}));
vi.mock("./agente.extracao", async (original) => ({ ...(await original<typeof import("./agente.extracao")>()), extrair: vi.fn() }));
vi.mock("@modulos/gastos-fixos/gastos-fixos.service", () => ({ default: { gerarPendentes: vi.fn(async () => undefined) } }));
vi.mock("@modulos/lancamentos/lancamentos.service", () => ({ default: { create: vi.fn(), delete: vi.fn(async () => undefined) } }));
vi.mock("@modulos/lancamentos/lancamentos.repository", () => ({ default: { readUltimoPorOrigem: vi.fn(), readGrupo: vi.fn() } }));
vi.mock("@modulos/resumo/resumo.service", () => ({ default: { read: vi.fn() } }));
vi.mock("@modulos/categorias/categorias.service", () => ({ default: { read: vi.fn() } }));
vi.mock("@modulos/cartoes/cartoes.service", () => ({ default: { read: vi.fn() } }));
vi.mock("@helpers/competencia.helper", async (original) => ({
  ...(await original<typeof import("@helpers/competencia.helper")>()),
  competenciaAtual: () => "2026-10",
}));

import AgenteService from "./agente.service";
import Repository from "../telegram.repository";
import TelegramCliente, { TelegramErro } from "../telegram.cliente";
import { extrair, Extracao } from "./agente.extracao";
import LancamentosService from "@modulos/lancamentos/lancamentos.service";
import LancamentosRepository from "@modulos/lancamentos/lancamentos.repository";
import ResumoService from "@modulos/resumo/resumo.service";
import CartoesService from "@modulos/cartoes/cartoes.service";
import GastosFixosService from "@modulos/gastos-fixos/gastos-fixos.service";
import Respostas from "./agente.respostas";
import { gerarCodigo, hashCodigo } from "../telegram.seguranca";
import { UpdateTelegramDto } from "../dtos/update.dto";

const repo = vi.mocked(Repository);
const cliente = vi.mocked(TelegramCliente);
const extrairMock = vi.mocked(extrair);
const lancamentos = vi.mocked(LancamentosService);
const lancamentosRepo = vi.mocked(LancamentosRepository);
const resumo = vi.mocked(ResumoService);
const cartoesService = vi.mocked(CartoesService);

const USUARIO = { id: "usuario-1", nome: "Bianca" };
let proximoUpdate = 1000;
let proximoChat = 1;

function update(texto: string | undefined, opcoes: { chatId?: number; updateId?: number; tipo?: string } = {}): UpdateTelegramDto {
  return {
    update_id: opcoes.updateId ?? proximoUpdate++,
    message: {
      message_id: 1,
      chat: { id: opcoes.chatId ?? 42, type: opcoes.tipo ?? "private" },
      from: { id: 7, username: "bianca" },
      ...(texto === undefined ? {} : { text: texto }),
    },
  };
}

const enviado = () => cliente.enviarMensagem.mock.calls.map(([, texto]) => texto);

const extracaoGasto: Extracao = {
  intencao: "REGISTRAR",
  consulta: null,
  lancamento: {
    tipo: "SAIDA",
    valorCentavos: 4500,
    descricao: "Mercado",
    categoriaNome: "Mercado",
    formaPagamento: "PIX",
    cartaoNome: null,
    parcelas: null,
    data: null,
    duvida: null,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  config.anthropic.habilitado = true;
  repo.readPorChat.mockResolvedValue(USUARIO);
  repo.readContexto.mockResolvedValue({
    categorias: [
      { id: "cat-mercado", nome: "Mercado", aceitaVr: true },
      { id: "cat-saude", nome: "Saúde", aceitaVr: false },
      { id: "cat-outros", nome: "Outros", aceitaVr: false },
    ],
    cartoes: [{ id: "cartao-nubank", nome: "Nubank" }],
    temCarteiraVr: false,
  });
  // Idempotência como no banco: (canal, idExterno) único.
  const vistos = new Set<string>();
  repo.registrarMensagem.mockImplementation((async (dados: { idExterno?: string }) => {
    if (dados.idExterno) {
      if (vistos.has(dados.idExterno)) throw new Prisma.PrismaClientKnownRequestError("único", { code: "P2002", clientVersion: "5.22.0" });
      vistos.add(dados.idExterno);
    }
    return { id: "m" };
  }) as never);
  lancamentos.create.mockResolvedValue({
    lancamentos: [],
    impacto: { sobraCentavos: 10000, faturaTotalCentavos: null, faturaCompetencia: null, saldoVrCentavos: null, saldoInsuficiente: false },
  } as never);
});

describe("AgenteService.processar", () => {
  it("mesmo update_id duas vezes → um lançamento só", async () => {
    extrairMock.mockResolvedValue({ ok: true, extracao: extracaoGasto });
    const chatId = 100 + proximoChat++;
    await AgenteService.processar(update("mercado 45 pix", { chatId, updateId: 555 }));
    const segunda = await AgenteService.processar(update("mercado 45 pix", { chatId, updateId: 555 }));
    expect(segunda.intencao).toBe("DUPLICADO");
    expect(lancamentos.create).toHaveBeenCalledTimes(1);
    expect(extrairMock).toHaveBeenCalledTimes(1);
    expect(lancamentos.create).toHaveBeenCalledWith(
      "usuario-1",
      expect.objectContaining({ tipo: "SAIDA", valorCentavos: 4500, formaPagamento: "PIX", categoriaId: "cat-mercado", parcelas: 1 }),
      { origem: "TELEGRAM", revisado: true, observacao: 'Mensagem: "mercado 45 pix".' },
    );
    expect(GastosFixosService.gerarPendentes).toHaveBeenCalledWith("usuario-1");
    expect(cliente.digitando).toHaveBeenCalled();
    expect(enviado()[0]).toMatch(/^Anotado: Mercado/);
    // grava a mensagem do usuário (com update_id) e a resposta do agente
    expect(repo.registrarMensagem).toHaveBeenCalledWith({ usuarioId: "usuario-1", papel: "USUARIO", texto: "mercado 45 pix", idExterno: "555" });
    expect(repo.registrarMensagem).toHaveBeenCalledWith(expect.objectContaining({ papel: "AGENTE" }));
  });

  it("erro 4xx do lançamento vira resposta no chat", async () => {
    const AppException = (await import("@erros/app-exception")).default;
    extrairMock.mockResolvedValue({ ok: true, extracao: extracaoGasto });
    lancamentos.create.mockRejectedValueOnce(new AppException(400, "Escolha uma categoria."));
    await AgenteService.processar(update("mercado 45", { chatId: 100 + proximoChat++ }));
    expect(enviado()).toEqual(["Escolha uma categoria."]);
  });

  it("falha da extração responde o texto dela", async () => {
    extrairMock.mockResolvedValue({ ok: false, motivo: "OCUPADO", resposta: Respostas.OCUPADO });
    await AgenteService.processar(update("mercado 45", { chatId: 100 + proximoChat++ }));
    expect(enviado()).toEqual([Respostas.OCUPADO]);
  });

  it("chat não vinculado não chama o Claude", async () => {
    repo.readPorChat.mockResolvedValue(null);
    const r = await AgenteService.processar(update("mercado 45"));
    expect(r.intencao).toBe("NAO_VINCULADO");
    expect(extrairMock).not.toHaveBeenCalled();
    expect(repo.registrarMensagem).not.toHaveBeenCalled();
    expect(enviado()).toEqual([Respostas.NAO_VINCULADO]);
  });

  it("grupo é ignorado", async () => {
    const r = await AgenteService.processar(update("mercado 45", { tipo: "group" }));
    expect(r.intencao).toBe("IGNORADO");
    expect(cliente.enviarMensagem).not.toHaveBeenCalled();
  });

  it("mensagem sem texto → só entendo texto", async () => {
    const r = await AgenteService.processar(update(undefined));
    expect(r.intencao).toBe("NAO_TEXTO");
    expect(enviado()).toEqual([Respostas.SO_TEXTO]);
    expect(extrairMock).not.toHaveBeenCalled();
  });

  it("mensagem longa demais não vai ao Claude", async () => {
    const r = await AgenteService.processar(update("a".repeat(501)));
    expect(r.intencao).toBe("LONGA");
    expect(enviado()).toEqual([Respostas.MENSAGEM_LONGA]);
    expect(extrairMock).not.toHaveBeenCalled();
  });

  describe("/start <código>", () => {
    // Banco falso do vínculo: uso único e expiração, como o updateMany condicional.
    const codigos = new Map<string, { nome: string; expiraEm: number; trocouConta?: boolean }>();
    beforeEach(() => {
      codigos.clear();
      repo.vincular.mockImplementation(async (hash: string) => {
        const registro = codigos.get(hash);
        if (!registro || registro.expiraEm <= Date.now()) return null;
        codigos.delete(hash);
        return { nome: registro.nome, trocouConta: registro.trocouConta ?? false };
      });
    });

    it("código válido conecta", async () => {
      const codigo = gerarCodigo();
      codigos.set(hashCodigo(codigo), { nome: "Bianca", expiraEm: Date.now() + 60_000 });
      const r = await AgenteService.processar(update(`/start ${codigo}`, { chatId: 77 }));
      expect(r.intencao).toBe("VINCULO");
      expect(repo.vincular).toHaveBeenCalledWith(hashCodigo(codigo), "77", "bianca");
      expect(enviado()[0]).toMatch(/^Conectado, Bianca!/);
      expect(enviado()[0]).not.toContain(Respostas.CHAT_MOVIDO);
      expect(extrairMock).not.toHaveBeenCalled();
    });

    it("chat que estava em outra conta: conecta e avisa que foi movido", async () => {
      const codigo = gerarCodigo();
      codigos.set(hashCodigo(codigo), { nome: "Bianca", expiraEm: Date.now() + 60_000, trocouConta: true });
      const r = await AgenteService.processar(update(`/start ${codigo}`, { chatId: 78 }));
      expect(r.intencao).toBe("VINCULO_MOVIDO");
      expect(enviado()[0]).toMatch(/^Conectado, Bianca!/);
      expect(enviado()[0]).toContain("Este chat estava ligado a outra conta e agora foi movido para a sua.");
    });

    it("código vencido → link expirou", async () => {
      const codigo = gerarCodigo();
      codigos.set(hashCodigo(codigo), { nome: "Bianca", expiraEm: Date.now() - 1 });
      const r = await AgenteService.processar(update(`/start ${codigo}`));
      expect(r.intencao).toBe("VINCULO_INVALIDO");
      expect(enviado()).toEqual([Respostas.LINK_EXPIRADO]);
    });

    it("código reutilizado → link expirou na segunda vez", async () => {
      const codigo = gerarCodigo();
      codigos.set(hashCodigo(codigo), { nome: "Bianca", expiraEm: Date.now() + 60_000 });
      await AgenteService.processar(update(`/start ${codigo}`));
      const r = await AgenteService.processar(update(`/start ${codigo}`));
      expect(r.intencao).toBe("VINCULO_INVALIDO");
      expect(enviado()[1]).toBe(Respostas.LINK_EXPIRADO);
    });

    it("código fora do formato nem vai ao banco", async () => {
      await AgenteService.processar(update("/start código inválido!"));
      expect(repo.vincular).not.toHaveBeenCalled();
      expect(enviado()).toEqual([Respostas.LINK_EXPIRADO]);
    });
  });

  it("/desconectar desliga o chat", async () => {
    const r = await AgenteService.processar(update("/desconectar", { chatId: 88 }));
    expect(r.intencao).toBe("DESCONECTAR");
    expect(repo.desvincularChat).toHaveBeenCalledWith("88");
    expect(enviado()).toEqual([Respostas.DESCONECTADO]);
  });

  it("/ajuda responde exemplos sem chamar o Claude", async () => {
    await AgenteService.processar(update("/ajuda"));
    expect(enviado()).toEqual([Respostas.ajuda()]);
    expect(extrairMock).not.toHaveBeenCalled();
  });

  it("apagar último parcelado apaga o grupo inteiro a partir da parcela 1 (pelas regras)", async () => {
    const parcela = (n: number) => ({ id: `p${n}`, descricao: `Tênis (${n}/3)`, valorCentavos: 10000, data: new Date("2026-10-22T15:00:00Z"), grupoParcelaId: "g1", parcelaNumero: n, parcelaTotal: 3 });
    lancamentosRepo.readUltimoPorOrigem.mockResolvedValue(parcela(2) as never);
    lancamentosRepo.readGrupo.mockResolvedValue([parcela(1), parcela(2), parcela(3)] as never);
    await AgenteService.processar(update("apaga o último", { chatId: 100 + proximoChat++ }));
    expect(lancamentosRepo.readUltimoPorOrigem).toHaveBeenCalledWith("usuario-1", "TELEGRAM", expect.any(Date));
    expect(lancamentosRepo.readGrupo).toHaveBeenCalledWith("usuario-1", "g1", { gte: 1 });
    expect(lancamentos.delete).toHaveBeenCalledWith("usuario-1", "p1", true);
    expect(extrairMock).not.toHaveBeenCalled();
    expect(enviado()[0].replace(/ /g, " ")).toBe('Apaguei a compra parcelada "Tênis" (3 parcelas, total R$ 300,00).');
  });

  it("apagar último sem nada recente avisa", async () => {
    lancamentosRepo.readUltimoPorOrigem.mockResolvedValue(null);
    const r = await AgenteService.processar(update("desfaz", { chatId: 100 + proximoChat++ }));
    expect(r).toEqual({ intencao: "APAGAR_ULTIMO", caminho: "REGRAS" });
    expect(lancamentos.delete).not.toHaveBeenCalled();
    expect(extrairMock).not.toHaveBeenCalled();
    expect(enviado()).toEqual([Respostas.NADA_PARA_APAGAR]);
  });

  it("bot bloqueado (403) desliga o chat e não quebra", async () => {
    repo.readPorChat.mockResolvedValue(null);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    cliente.enviarMensagem.mockRejectedValueOnce(new TelegramErro(403, "Forbidden: bot was blocked by the user"));
    const r = await AgenteService.processar(update("oi", { chatId: 99 }));
    expect(r.intencao).toBe("NAO_VINCULADO");
    expect(repo.desvincularChat).toHaveBeenCalledWith("99");
  });

  it("limite de mensagens: a 21ª em 10 minutos não chama o Claude", async () => {
    extrairMock.mockResolvedValue({ ok: true, extracao: { intencao: "AJUDA", lancamento: null, consulta: null } });
    const chatId = 9000;
    for (let i = 0; i < 20; i++) await AgenteService.processar(update("oi", { chatId }));
    const r = await AgenteService.processar(update("oi", { chatId }));
    expect(r.intencao).toBe("LIMITE_JANELA");
    expect(extrairMock).toHaveBeenCalledTimes(20);
  });

  it("reenvio do mesmo update não gasta a cota do chat", async () => {
    const chatId = 9002;
    for (let i = 0; i < 25; i++) expect((await AgenteService.processar(update("ajuda", { chatId, updateId: 7777 }))).intencao).toBe(i === 0 ? "AJUDA" : "DUPLICADO");
    // 19 mensagens novas ainda cabem na janela (20 no total com a primeira)
    for (let i = 0; i < 19; i++) expect((await AgenteService.processar(update("ajuda", { chatId }))).intencao).toBe("AJUDA");
    expect((await AgenteService.processar(update("ajuda", { chatId }))).intencao).toBe("LIMITE_JANELA");
  });

  it("teto global do Claude estourado: responde o formato sem chamar o Claude", async () => {
    const permitirClaude = vi.spyOn(AgenteService.limitador, "permitirClaude").mockReturnValueOnce(false);
    const r = await AgenteService.processar(update("gastei 45 no mercado", { chatId: 100 + proximoChat++ }));
    expect(r).toEqual({ intencao: "LIMITE_GLOBAL", caminho: "SEM_CLAUDE" });
    expect(permitirClaude).toHaveBeenCalledTimes(1);
    expect(extrairMock).not.toHaveBeenCalled();
    expect(enviado()).toEqual([Respostas.FORMATO]);
    permitirClaude.mockRestore();
  });

  it("teto global só é consultado quando o Claude seria chamado", async () => {
    const permitirClaude = vi.spyOn(AgenteService.limitador, "permitirClaude");
    await AgenteService.processar(update("debito farmacia 2,90", { chatId: 100 + proximoChat++ }));
    expect(permitirClaude).not.toHaveBeenCalled();
    permitirClaude.mockRestore();
  });

  it("falha no banco depois de registrar a mensagem responde FALHA no chat", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    repo.readContexto.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("texto sensível", { code: "P1001", clientVersion: "5.22.0" }));
    const r = await AgenteService.processar(update("debito farmacia 2,90", { chatId: 100 + proximoChat++ }));
    expect(r.intencao).toBe("FALHA");
    expect(cliente.enviarMensagem).toHaveBeenCalledWith(expect.any(String), Respostas.FALHA);
    expect(lancamentos.create).not.toHaveBeenCalled();
    // log só com nome/código, nunca a mensagem do erro
    expect(JSON.stringify(log.mock.calls)).not.toContain("texto sensível");
    log.mockRestore();
  });

  it("falha ao ler o chat também responde FALHA", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    repo.readPorChat.mockRejectedValueOnce(new Error("conexão"));
    const r = await AgenteService.processar(update("sobra", { chatId: 100 + proximoChat++ }));
    expect(r.intencao).toBe("FALHA");
    expect(enviado()).toEqual([Respostas.FALHA]);
    log.mockRestore();
  });

  it("limite de mensagens vale também para o que as regras leem", async () => {
    const chatId = 9001;
    for (let i = 0; i < 20; i++) await AgenteService.processar(update("ajuda", { chatId }));
    const r = await AgenteService.processar(update("ajuda", { chatId }));
    expect(r.intencao).toBe("LIMITE_JANELA");
    expect(cliente.enviarMensagem).toHaveBeenCalledTimes(21); // 20 ajudas + 1 aviso de limite
    expect(extrairMock).not.toHaveBeenCalled();
  });

  describe("regras primeiro, Claude só como reserva", () => {
    const chat = () => ({ chatId: 100 + proximoChat++ });
    const semNbsp = (texto: string) => texto.replace(/ /g, " ");

    it("(a) gramática com Claude habilitado: lança sem chamar o Claude", async () => {
      const r = await AgenteService.processar(update("debito farmacia 2,90", chat()));
      expect(r).toEqual({ intencao: "REGISTRAR", caminho: "REGRAS" });
      expect(extrairMock).not.toHaveBeenCalled();
      expect(lancamentos.create).toHaveBeenCalledWith(
        "usuario-1",
        expect.objectContaining({ tipo: "SAIDA", descricao: "Farmacia", valorCentavos: 290, formaPagamento: "DEBITO", categoriaId: "cat-saude", parcelas: 1 }),
        { origem: "TELEGRAM", revisado: true, observacao: 'Mensagem: "debito farmacia 2,90".' },
      );
    });

    it("(b) texto livre com Claude habilitado: chama o Claude uma vez", async () => {
      extrairMock.mockResolvedValue({ ok: true, extracao: extracaoGasto });
      const r = await AgenteService.processar(update("gastei 45 no mercado", chat()));
      expect(r).toEqual({ intencao: "REGISTRAR", caminho: "CLAUDE" });
      expect(extrairMock).toHaveBeenCalledTimes(1);
      expect(lancamentos.create).toHaveBeenCalledTimes(1);
    });

    it("(c) texto livre sem Claude: responde o formato", async () => {
      config.anthropic.habilitado = false;
      const r = await AgenteService.processar(update("gastei 45 no mercado", chat()));
      expect(r).toEqual({ intencao: "DESCONHECIDO", caminho: "SEM_CLAUDE" });
      expect(extrairMock).not.toHaveBeenCalled();
      expect(lancamentos.create).not.toHaveBeenCalled();
      expect(enviado()).toEqual([Respostas.FORMATO]);
    });

    it("(d) gramática sem Claude: lança normalmente", async () => {
      config.anthropic.habilitado = false;
      repo.readContexto.mockResolvedValue({ categorias: [{ id: "cat-mercado", nome: "Mercado", aceitaVr: true }], cartoes: [], temCarteiraVr: true });
      const r = await AgenteService.processar(update("vr mercado 230", chat()));
      expect(r).toEqual({ intencao: "REGISTRAR", caminho: "REGRAS" });
      expect(extrairMock).not.toHaveBeenCalled();
      expect(lancamentos.create).toHaveBeenCalledWith(
        "usuario-1",
        expect.objectContaining({ valorCentavos: 23000, formaPagamento: "VR", categoriaId: "cat-mercado" }),
        expect.objectContaining({ revisado: true }),
      );
    });

    it("(e) /sobra, /fatura nubank e /apagar passam pelas regras", async () => {
      resumo.read.mockResolvedValue({ sobraCentavos: 100000, diasRestantes: 10, podeGastarPorDiaCentavos: 10000, pendencias: 0 } as never);
      cartoesService.read.mockResolvedValue([
        {
          nome: "Nubank",
          ativo: true,
          limiteCentavos: null,
          limiteUsadoCentavos: 0,
          faturaAtual: { totalCentavos: 5000, vencimento: "2026-11-10T15:00:00.000Z", status: "ABERTA", competencia: "2026-11" },
        },
      ] as never);
      lancamentosRepo.readUltimoPorOrigem.mockResolvedValue(null);

      expect(await AgenteService.processar(update("/sobra", chat()))).toEqual({ intencao: "CONSULTAR_SOBRA", caminho: "REGRAS" });
      expect(resumo.read).toHaveBeenCalledWith("usuario-1", "2026-10");
      expect(await AgenteService.processar(update("/fatura nubank", chat()))).toEqual({ intencao: "CONSULTAR_FATURA", caminho: "REGRAS" });
      expect(await AgenteService.processar(update("/apagar", chat()))).toEqual({ intencao: "APAGAR_ULTIMO", caminho: "REGRAS" });
      expect(extrairMock).not.toHaveBeenCalled();
      const respostas = enviado().map(semNbsp);
      expect(respostas[0]).toMatch(/^Sobra de 10\/2026: R\$ 1\.000,00\./);
      expect(respostas[1]).toBe("Fatura Nubank (vence 10/11): R$ 50,00, aberta.");
      expect(respostas[2]).toBe(Respostas.NADA_PARA_APAGAR);
    });

    it("(f) comando desconhecido responde a ajuda sem Claude", async () => {
      const r = await AgenteService.processar(update("/xyz", chat()));
      expect(r).toEqual({ intencao: "AJUDA", caminho: "REGRAS" });
      expect(enviado()).toEqual([Respostas.ajuda()]);
      expect(extrairMock).not.toHaveBeenCalled();
    });

    it("(g) começa com forma mas está incompleta: formato, sem Claude", async () => {
      const r = await AgenteService.processar(update("debito farmacia", chat()));
      expect(r).toEqual({ intencao: "DESCONHECIDO", caminho: "REGRAS" });
      expect(enviado()).toEqual([Respostas.FORMATO]);
      expect(extrairMock).not.toHaveBeenCalled();
    });

    it("(i) entrada salario 4500 cai como entrada Pix, sem categoria, revisada", async () => {
      await AgenteService.processar(update("entrada salario 4500", chat()));
      expect(extrairMock).not.toHaveBeenCalled();
      expect(lancamentos.create).toHaveBeenCalledTimes(1);
      const [, dto, opcoes] = lancamentos.create.mock.calls[0];
      expect(dto).toEqual(expect.objectContaining({ tipo: "ENTRADA", formaPagamento: "PIX", valorCentavos: 450000, descricao: "Salario" }));
      expect(dto).not.toHaveProperty("categoriaId");
      expect(opcoes).toEqual(expect.objectContaining({ revisado: true }));
    });

    it("(j) entrada vr 800 com carteira VR lança no VR", async () => {
      repo.readContexto.mockResolvedValue({ categorias: [{ id: "cat-outros", nome: "Outros", aceitaVr: false }], cartoes: [], temCarteiraVr: true });
      await AgenteService.processar(update("entrada vr 800", chat()));
      expect(lancamentos.create).toHaveBeenCalledWith(
        "usuario-1",
        expect.objectContaining({ tipo: "ENTRADA", formaPagamento: "VR", valorCentavos: 80000, descricao: "Crédito do VR" }),
        expect.objectContaining({ revisado: true }),
      );
    });

    it("(j) entrada vr 800 sem carteira VR pede para cadastrar", async () => {
      repo.readContexto.mockResolvedValue({ categorias: [{ id: "cat-outros", nome: "Outros", aceitaVr: false }], cartoes: [], temCarteiraVr: false });
      await AgenteService.processar(update("entrada vr 800", chat()));
      expect(lancamentos.create).not.toHaveBeenCalled();
      expect(enviado()).toEqual(["Cadastre a carteira VR no app antes de usar VR."]);
    });
  });
});
