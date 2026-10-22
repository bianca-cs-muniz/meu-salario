import { describe, it, expect, vi, beforeEach } from "vitest";

// Sem banco e sem rede: agente, repositório e cliente do Telegram são falsos.
vi.mock("@config/app.config", () => ({ default: { telegram: { habilitado: true, botUsername: "bot" }, anthropic: { habilitado: false } } }));
vi.mock("./telegram.repository", () => ({ default: { desvincularUsuario: vi.fn() } }));
vi.mock("./telegram.cliente", async (original) => ({
  ...(await original<typeof import("./telegram.cliente")>()),
  default: { enviarMensagem: vi.fn() },
}));
vi.mock("./agente/agente.service", () => ({ default: { processar: vi.fn() } }));

import TelegramService from "./telegram.service";
import Repository from "./telegram.repository";
import TelegramCliente from "./telegram.cliente";
import AgenteService from "./agente/agente.service";
import Respostas from "./agente/agente.respostas";
import { UpdateTelegramDto } from "./dtos/update.dto";

const processar = vi.mocked(AgenteService.processar);
const filas = () => (TelegramService as unknown as { filas: Map<string, Promise<unknown>> }).filas;

function update(updateId: number, chatId?: number): UpdateTelegramDto {
  return chatId === undefined
    ? { update_id: updateId }
    : { update_id: updateId, message: { message_id: 1, chat: { id: chatId, type: "private" }, text: "x" } };
}

/** Promessa controlada de fora. */
function adiada() {
  let resolver!: () => void;
  const promessa = new Promise<void>((r) => (resolver = r));
  return { promessa, resolver };
}

const pausa = (ms = 20) => new Promise((r) => setTimeout(r, ms));
const esperarFilas = async () => {
  while (filas().size) await Promise.all([...filas().values()]);
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "info").mockImplementation(() => undefined);
});

describe("TelegramService.agendar (fila por chat)", () => {
  it("mesmo chat: a segunda mensagem só começa depois da primeira (mesmo lenta)", async () => {
    const eventos: string[] = [];
    const lenta = adiada();
    processar.mockImplementation(async (u) => {
      eventos.push(`inicio:${u.update_id}`);
      if (u.update_id === 1) await lenta.promessa;
      eventos.push(`fim:${u.update_id}`);
      return { intencao: "OK" };
    });

    TelegramService.agendar(update(1, 10));
    TelegramService.agendar(update(2, 10));
    await pausa();
    expect(eventos).toEqual(["inicio:1"]);

    lenta.resolver();
    await esperarFilas();
    expect(eventos).toEqual(["inicio:1", "fim:1", "inicio:2", "fim:2"]);
    expect(filas().size).toBe(0); // a entrada some ao terminar (sem vazar memória)
  });

  it("chats diferentes rodam em paralelo", async () => {
    const eventos: string[] = [];
    const lenta = adiada();
    processar.mockImplementation(async (u) => {
      eventos.push(`inicio:${u.update_id}`);
      if (u.update_id === 1) await lenta.promessa;
      eventos.push(`fim:${u.update_id}`);
      return { intencao: "OK" };
    });

    TelegramService.agendar(update(1, 20));
    TelegramService.agendar(update(2, 21));
    await pausa();
    expect(eventos).toEqual(["inicio:1", "inicio:2", "fim:2"]);

    lenta.resolver();
    await esperarFilas();
    expect(eventos).toContain("fim:1");
    expect(filas().size).toBe(0);
  });

  it("falha num update não trava a fila do chat", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    processar.mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce({ intencao: "OK" });
    TelegramService.agendar(update(1, 30));
    TelegramService.agendar(update(2, 30));
    await pausa();
    await esperarFilas();
    expect(processar).toHaveBeenCalledTimes(2);
    expect(filas().size).toBe(0);
    log.mockRestore();
  });

  it("update sem chat roda fora da fila", async () => {
    processar.mockResolvedValue({ intencao: "IGNORADO" });
    TelegramService.agendar(update(1));
    expect(filas().size).toBe(0);
    await pausa();
    expect(processar).toHaveBeenCalledTimes(1);
  });

  it("processa depois de devolver o controle (não roda de forma síncrona)", async () => {
    processar.mockResolvedValue({ intencao: "OK" });
    TelegramService.agendar(update(1, 40));
    expect(processar).not.toHaveBeenCalled();
    await esperarFilas();
    expect(processar).toHaveBeenCalledTimes(1);
  });
});

describe("TelegramService.desconectar", () => {
  it("não espera o aviso no Telegram e só loga se falhar", async () => {
    vi.mocked(Repository.desvincularUsuario).mockResolvedValue("55");
    const envio = adiada();
    vi.mocked(TelegramCliente.enviarMensagem).mockReturnValue(envio.promessa.then(() => Promise.reject(new Error("rede"))));
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await TelegramService.desconectar("usuario-1"); // resolve com o envio ainda pendente
    expect(TelegramCliente.enviarMensagem).toHaveBeenCalledWith("55", Respostas.DESCONECTADO);
    expect(log).not.toHaveBeenCalled();

    envio.resolver();
    await pausa(0);
    expect(log).toHaveBeenCalledWith("[telegram] falha ao avisar desconexão", expect.objectContaining({ erro: "Error" }));
    log.mockRestore();
  });

  it("sem chat ligado não envia nada", async () => {
    vi.mocked(Repository.desvincularUsuario).mockResolvedValue(null);
    await TelegramService.desconectar("usuario-1");
    expect(TelegramCliente.enviarMensagem).not.toHaveBeenCalled();
  });
});
