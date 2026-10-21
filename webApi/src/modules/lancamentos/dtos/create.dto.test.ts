import { describe, it, expect } from "vitest";
import { CreateLancamentoSchema, dataTexto, dataValida } from "./create.dto";

describe("dataValida", () => {
  it.each([
    "2026-10-21",
    "2026-10-21T13:00:00Z",
    "2026-10-21T13:00:00.123Z",
    "2026-10-21T10:00:00-03:00",
    "2026-10-21T10:00-03:00",
    "2028-02-29",
  ])("aceita %s", (texto) => expect(dataValida(texto)).toBe(true));

  it.each([
    "2026-02-31",
    "2026-02-29",
    "2026-13-01",
    "2026-00-10",
    "2026-10-00",
    "21/10/2026",
    "2026-10-21T10:00",
    "2026-10-21T10:00:00",
    "2026-10-21T24:00:00Z",
    "2026-02-31T10:00:00Z",
    "2026-10-21 10:00:00Z",
    "abc",
    "",
  ])("rejeita %s", (texto) => expect(dataValida(texto)).toBe(false));
});

describe("dataTexto (Zod)", () => {
  it("rejeita número com a mensagem de data inválida", () => {
    const r = dataTexto.safeParse(20261021);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("Data inválida.");
  });

  it("mensagem orienta o formato quando o texto é inválido", () => {
    const r = dataTexto.safeParse("21/10/2026");
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toContain("AAAA-MM-DD");
  });
});

describe("CreateLancamentoSchema.data", () => {
  const base = { tipo: "SAIDA", descricao: "Mercado", valorCentavos: 1000, formaPagamento: "PIX" };

  it("data é opcional", () => expect(CreateLancamentoSchema.safeParse(base).success).toBe(true));
  it("aceita data AAAA-MM-DD", () => expect(CreateLancamentoSchema.safeParse({ ...base, data: "2026-10-21" }).success).toBe(true));
  it("rejeita data inexistente", () => expect(CreateLancamentoSchema.safeParse({ ...base, data: "2026-02-31" }).success).toBe(false));
});
