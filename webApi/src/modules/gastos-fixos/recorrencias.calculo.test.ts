import { describe, it, expect } from "vitest";
import { competenciasAGerar, lancamentoDoMes } from "./recorrencias.calculo";
import { competenciaDe } from "../../shared/helpers/competencia.helper";

describe("competenciasAGerar", () => {
  it("sem geradaAte começa no início", () =>
    expect(competenciasAGerar({ inicio: "2026-10", fim: null, geradaAte: null }, "2026-10")).toEqual(["2026-10", "2026-11"]));

  it("com geradaAte começa no mês seguinte", () =>
    expect(competenciasAGerar({ inicio: "2026-08", fim: null, geradaAte: "2026-10" }, "2026-10")).toEqual(["2026-11"]));

  it("vai no máximo até o mês atual + 1", () =>
    expect(competenciasAGerar({ inicio: "2026-08", fim: null, geradaAte: null }, "2026-10")).toEqual(["2026-08", "2026-09", "2026-10", "2026-11"]));

  it("respeita o fim", () =>
    expect(competenciasAGerar({ inicio: "2026-08", fim: "2026-09", geradaAte: null }, "2026-10")).toEqual(["2026-08", "2026-09"]));

  it("vazio quando já gerado até o mês atual + 1", () =>
    expect(competenciasAGerar({ inicio: "2026-08", fim: null, geradaAte: "2026-11" }, "2026-10")).toEqual([]));

  it("vira o ano", () =>
    expect(competenciasAGerar({ inicio: "2026-11", fim: null, geradaAte: "2026-11" }, "2026-12")).toEqual(["2026-12", "2027-01"]));
});

describe("lancamentoDoMes", () => {
  it("fora do crédito, competência e mesRecorrencia são o próprio mês", () => {
    const r = lancamentoDoMes("2026-10", 5, null);
    expect(r.competencia).toBe("2026-10");
    expect(r.mesRecorrencia).toBe("2026-10");
    expect(competenciaDe(r.data)).toBe("2026-10");
  });

  it("dia 31 em fevereiro vira o último dia do mês", () => {
    const r = lancamentoDoMes("2027-02", 31, null);
    expect(r.data.toISOString().slice(0, 10)).toBe("2027-02-28");
    expect(r.mesRecorrencia).toBe("2027-02");
  });

  describe("regressão: cartão fecha 10 e vence 17", () => {
    const cartao = { diaFechamento: 10, diaVencimento: 17 };
    const novembro = lancamentoDoMes("2026-11", 15, cartao);
    const dezembro = lancamentoDoMes("2026-12", 5, cartao);

    it("mês 2026-11 dia 15 cai na fatura de 2026-12", () => {
      expect(novembro.competencia).toBe("2026-12");
      expect(novembro.mesRecorrencia).toBe("2026-11");
    });

    it("mês 2026-12 dia 5 também cai na fatura de 2026-12", () => {
      expect(dezembro.competencia).toBe("2026-12");
      expect(dezembro.mesRecorrencia).toBe("2026-12");
    });

    it("mesma competência, mas chaves (mesRecorrencia) diferentes", () => {
      expect(novembro.competencia).toBe(dezembro.competencia);
      expect(novembro.mesRecorrencia).not.toBe(dezembro.mesRecorrencia);
    });
  });
});
