import { describe, it, expect } from "vitest";
import { statusFatura } from "./fatura.helper";

// Fecha 03/11 e vence 10/11, ambos ao meio-dia de São Paulo (15:00Z).
const fechamento = new Date("2026-11-03T15:00:00.000Z");
const vencimento = new Date("2026-11-10T15:00:00.000Z");
const vencimentoMais24h = new Date("2026-11-11T15:00:00.000Z");
const ms = (data: Date, delta: number) => new Date(data.getTime() + delta);

describe("statusFatura", () => {
  it("ABERTA antes do fechamento", () =>
    expect(statusFatura(null, fechamento, vencimento, 5000, new Date("2026-10-21T12:00:00.000Z"))).toBe("ABERTA"));

  it("ABERTA 1ms antes do fechamento", () =>
    expect(statusFatura(null, fechamento, vencimento, 5000, ms(fechamento, -1))).toBe("ABERTA"));

  it("FECHADA no instante exato do fechamento", () =>
    expect(statusFatura(null, fechamento, vencimento, 5000, fechamento)).toBe("FECHADA"));

  it("FECHADA no dia do vencimento", () =>
    expect(statusFatura(null, fechamento, vencimento, 5000, vencimento)).toBe("FECHADA"));

  it("FECHADA exatamente em vencimento + 24h", () =>
    expect(statusFatura(null, fechamento, vencimento, 5000, vencimentoMais24h)).toBe("FECHADA"));

  it("ATRASADA 1ms depois de vencimento + 24h com total > 0", () =>
    expect(statusFatura(null, fechamento, vencimento, 1, ms(vencimentoMais24h, 1))).toBe("ATRASADA"));

  it("total 0 nunca fica ATRASADA", () =>
    expect(statusFatura(null, fechamento, vencimento, 0, new Date("2027-06-01T00:00:00.000Z"))).toBe("FECHADA"));

  it("total negativo (crédito/estorno) nunca fica ATRASADA", () =>
    expect(statusFatura(null, fechamento, vencimento, -2500, new Date("2027-06-01T00:00:00.000Z"))).toBe("FECHADA"));

  it("PAGA mesmo depois de atrasada", () =>
    expect(statusFatura(new Date("2026-12-01T12:00:00.000Z"), fechamento, vencimento, 5000, new Date("2027-01-01T00:00:00.000Z"))).toBe("PAGA"));

  it("PAGA mesmo antes do fechamento (pagamento antecipado)", () =>
    expect(statusFatura(new Date("2026-10-20T12:00:00.000Z"), fechamento, vencimento, 5000, new Date("2026-10-21T12:00:00.000Z"))).toBe("PAGA"));
});
