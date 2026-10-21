import { describe, it, expect } from "vitest";
import { cicloDoCartao, deslocarCompetencia } from "./competencia.helper";
describe("competência", () => {
  it("avança dezembro para janeiro", () => expect(deslocarCompetencia("2026-12", 1)).toBe("2027-01"));
  it("compra no dia de fechamento vai para o próximo ciclo", () => expect(cicloDoCartao(new Date("2026-10-03T15:00:00.000Z"), 3, 10).competencia).toBe("2026-11"));
  it("compra antes do fechamento fica na fatura do mês", () => expect(cicloDoCartao(new Date("2026-10-02T15:00:00.000Z"), 3, 10).competencia).toBe("2026-10"));
  it("compra em dezembro pode vencer em janeiro", () => expect(cicloDoCartao(new Date("2026-12-04T15:00:00.000Z"), 3, 10).competencia).toBe("2027-01"));
  it("persiste fechamento e vencimento como meio-dia de São Paulo", () => { const ciclo=cicloDoCartao(new Date("2026-10-05T15:00:00.000Z"),3,10); expect(ciclo.fechamento.toISOString()).toBe("2026-11-03T15:00:00.000Z"); expect(ciclo.vencimento.toISOString()).toBe("2026-11-10T15:00:00.000Z"); });
});
