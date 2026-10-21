import { afterEach, describe, it, expect, vi } from "vitest";
import { cicloDaCompetencia, cicloDoCartao, dataNaCompetencia, inicioDeAmanha } from "./competencia.helper";

// São Paulo = UTC-3 (sem horário de verão desde 2019). Meio-dia SP = 15:00Z.
describe("cicloDoCartao (bordas)", () => {
  it("compra no dia do fechamento às 00:00 de SP já vai para o próximo ciclo", () => {
    const ciclo = cicloDoCartao(new Date("2026-10-03T03:00:00.000Z"), 3, 10);
    expect(ciclo.competencia).toBe("2026-11");
    expect(ciclo.fechamento.toISOString()).toBe("2026-11-03T15:00:00.000Z");
  });

  it("compra às 23:59 de SP da véspera do fechamento fica no ciclo atual", () =>
    expect(cicloDoCartao(new Date("2026-10-03T02:59:00.000Z"), 3, 10).competencia).toBe("2026-10"));

  it("compra às 22h de SP do dia 2 (já dia 3 em UTC) fica no ciclo do dia 2", () => {
    const ciclo = cicloDoCartao(new Date("2026-10-03T01:00:00.000Z"), 3, 10);
    expect(ciclo.competencia).toBe("2026-10");
    expect(ciclo.fechamento.toISOString()).toBe("2026-10-03T15:00:00.000Z");
  });

  it("vencimento antes do fechamento vence no mês seguinte ao fechamento", () => {
    const ciclo = cicloDoCartao(new Date("2026-10-10T15:00:00.000Z"), 25, 5);
    expect(ciclo.fechamento.toISOString()).toBe("2026-10-25T15:00:00.000Z");
    expect(ciclo.vencimento.toISOString()).toBe("2026-11-05T15:00:00.000Z");
    expect(ciclo.competencia).toBe("2026-11");
  });

  it("vencimento igual ao fechamento vence no mês seguinte", () => {
    const ciclo = cicloDoCartao(new Date("2026-10-05T15:00:00.000Z"), 10, 10);
    expect(ciclo.fechamento.toISOString()).toBe("2026-10-10T15:00:00.000Z");
    expect(ciclo.vencimento.toISOString()).toBe("2026-11-10T15:00:00.000Z");
  });

  it("virada dezembro-janeiro com vencimento <= fechamento: fecha em janeiro e vence em fevereiro", () => {
    const ciclo = cicloDoCartao(new Date("2026-12-26T15:00:00.000Z"), 25, 5);
    expect(ciclo.fechamento.toISOString()).toBe("2027-01-25T15:00:00.000Z");
    expect(ciclo.vencimento.toISOString()).toBe("2027-02-05T15:00:00.000Z");
    expect(ciclo.competencia).toBe("2027-02");
  });

  it("compra no réveillon às 22h de SP (já 2027 em UTC) fica no ciclo de dezembro", () => {
    const ciclo = cicloDoCartao(new Date("2027-01-01T01:00:00.000Z"), 3, 10);
    expect(ciclo.competencia).toBe("2027-01");
    expect(ciclo.fechamento.toISOString()).toBe("2027-01-03T15:00:00.000Z");
  });

  it.each([
    [0, 10],
    [29, 10],
    [3, 0],
    [3, 29],
  ])("rejeita fechamento %i / vencimento %i fora de 1..28", (fechamento, vencimento) =>
    expect(() => cicloDoCartao(new Date("2026-10-05T15:00:00.000Z"), fechamento, vencimento)).toThrow("entre 1 e 28"));
});

describe("cicloDaCompetencia", () => {
  it.each([
    ["2026-10", 3, 10],
    ["2026-11", 25, 5],
    ["2027-01", 25, 5],
    ["2027-01", 3, 10],
    ["2026-11", 10, 10],
  ])("ida e volta: competência %s com fechamento %i e vencimento %i", (competencia, fechamento, vencimento) => {
    const ciclo = cicloDaCompetencia(competencia, fechamento, vencimento);
    // Uma compra na véspera do fechamento cai exatamente nessa fatura.
    const vespera = new Date(ciclo.fechamento.getTime() - 86_400_000);
    const ida = cicloDoCartao(vespera, fechamento, vencimento);
    expect(ida.competencia).toBe(competencia);
    expect(ida.fechamento.toISOString()).toBe(ciclo.fechamento.toISOString());
    expect(ida.vencimento.toISOString()).toBe(ciclo.vencimento.toISOString());
  });

  it("volta: o ciclo de uma compra reconstruído pela competência é o mesmo", () => {
    const ida = cicloDoCartao(new Date("2026-12-26T15:00:00.000Z"), 25, 5);
    const volta = cicloDaCompetencia(ida.competencia, 25, 5);
    expect(volta.fechamento.toISOString()).toBe(ida.fechamento.toISOString());
    expect(volta.vencimento.toISOString()).toBe(ida.vencimento.toISOString());
  });

  it("vencimento <= fechamento: fechamento fica no mês anterior, inclusive na virada do ano", () => {
    const ciclo = cicloDaCompetencia("2027-01", 25, 5);
    expect(ciclo.fechamento.toISOString()).toBe("2026-12-25T15:00:00.000Z");
    expect(ciclo.vencimento.toISOString()).toBe("2027-01-05T15:00:00.000Z");
  });
});

describe("dataNaCompetencia", () => {
  it("dia 31 em fevereiro comum vira 28", () => expect(dataNaCompetencia("2026-02", 31).toISOString()).toBe("2026-02-28T15:00:00.000Z"));
  it("dia 31 em fevereiro bissexto vira 29", () => expect(dataNaCompetencia("2028-02", 31).toISOString()).toBe("2028-02-29T15:00:00.000Z"));
  it("dia 31 em mês de 30 dias vira 30", () => expect(dataNaCompetencia("2026-04", 31).toISOString()).toBe("2026-04-30T15:00:00.000Z"));
  it("dia válido fica ao meio-dia de SP", () => expect(dataNaCompetencia("2026-12", 31).toISOString()).toBe("2026-12-31T15:00:00.000Z"));
});

describe("inicioDeAmanha", () => {
  afterEach(() => vi.useRealTimers());

  it("23:59:59 de SP: amanhã começa 1s depois", () =>
    expect(inicioDeAmanha(new Date("2026-10-22T02:59:59.000Z")).toISOString()).toBe("2026-10-22T03:00:00.000Z"));

  it("00:00 de SP em ponto já é o dia novo", () =>
    expect(inicioDeAmanha(new Date("2026-10-22T03:00:00.000Z")).toISOString()).toBe("2026-10-23T03:00:00.000Z"));

  it("22h de SP (já dia seguinte em UTC) ainda usa o dia de SP", () =>
    expect(inicioDeAmanha(new Date("2026-10-22T01:00:00.000Z")).toISOString()).toBe("2026-10-22T03:00:00.000Z"));

  it("virada do ano", () => expect(inicioDeAmanha(new Date("2027-01-01T01:00:00.000Z")).toISOString()).toBe("2027-01-01T03:00:00.000Z"));

  it("fim de fevereiro bissexto", () => expect(inicioDeAmanha(new Date("2028-02-28T15:00:00.000Z")).toISOString()).toBe("2028-02-29T03:00:00.000Z"));

  it("sem parâmetro usa o relógio atual", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-21T23:30:00.000Z"));
    expect(inicioDeAmanha().toISOString()).toBe("2026-10-22T03:00:00.000Z");
  });
});
