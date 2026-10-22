import { describe, it, expect, vi, beforeEach } from "vitest";

// Sem banco: o $transaction recebe um "tx" falso.
const tx = vi.hoisted(() => ({
  usuario: { findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
}));
vi.mock("@database/data-source", () => ({
  default: {
    usuario: tx.usuario,
    $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
  },
}));

import Repository from "./telegram.repository";
import DataSource from "@database/data-source";

beforeEach(() => {
  vi.clearAllMocks();
  tx.usuario.updateMany.mockReset();
});

describe("TelegramRepository.vincular", () => {
  beforeEach(() => tx.usuario.findFirst.mockResolvedValue({ id: "u-novo", nome: "Bianca" }));

  it("chat que estava em outra conta → trocouConta: true", async () => {
    tx.usuario.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 1 });
    expect(await Repository.vincular("hash", "42", "bianca")).toEqual({ nome: "Bianca", trocouConta: true });
    expect(tx.usuario.updateMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ where: { telegramChatId: "42", id: { not: "u-novo" } } }));
  });

  it("chat livre (ou já da mesma conta) → trocouConta: false", async () => {
    tx.usuario.updateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 1 });
    expect(await Repository.vincular("hash", "42", null)).toEqual({ nome: "Bianca", trocouConta: false });
  });

  it("código já usado no meio do caminho → null", async () => {
    tx.usuario.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    expect(await Repository.vincular("hash", "42", null)).toBeNull();
  });
});

describe("TelegramRepository.desvincularUsuario", () => {
  it("lê o chat anterior e desliga na mesma transação", async () => {
    tx.usuario.findUnique.mockResolvedValue({ telegramChatId: "42" });
    tx.usuario.update.mockResolvedValue({ id: "u1" });
    expect(await Repository.desvincularUsuario("u1")).toBe("42");
    expect(DataSource.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.usuario.findUnique).toHaveBeenCalledWith({ where: { id: "u1" }, select: { telegramChatId: true } });
    expect(tx.usuario.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1" }, data: expect.objectContaining({ telegramChatId: null, telegramCodigoHash: null }) }),
    );
  });

  it("sem chat ligado → null", async () => {
    tx.usuario.findUnique.mockResolvedValue({ telegramChatId: null });
    tx.usuario.update.mockResolvedValue({ id: "u1" });
    expect(await Repository.desvincularUsuario("u1")).toBeNull();
  });
});
