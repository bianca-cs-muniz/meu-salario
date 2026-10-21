import { describe, it, expect } from "vitest";
import { camposDoLancamentoFuturo, competenciasAGerar, FixoEditado, lancamentoDoMes } from "./recorrencias.calculo";
import { competenciaDe, interpretarData } from "../../shared/helpers/competencia.helper";

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

describe("camposDoLancamentoFuturo", () => {
  // Hoje 21/10/2026: futuro = a partir de 22/10.
  const aPartirDe = interpretarData("2026-10-22T03:00:00.000Z");
  const novembro = { data: interpretarData("2026-11-20"), valorCentavos: 5590, competencia: "2026-12", mesRecorrencia: "2026-11" };
  const base: FixoEditado = {
    descricao: "Netflix",
    valorCentavos: 5590,
    valorAntigo: 5590,
    novoDiaDoMes: null,
    formaPagamento: "CREDITO",
    categoriaId: "cat",
    carteiraId: null,
    cartao: { id: "c1", diaFechamento: 10, diaVencimento: 17 },
  };

  it("troca de cartão: aplica o novo cartão e recalcula a competência pelo novo ciclo", () => {
    const r = camposDoLancamentoFuturo(novembro, { ...base, cartao: { id: "c2", diaFechamento: 25, diaVencimento: 5 } }, aPartirDe);
    expect(r.cartaoId).toBe("c2");
    expect(r.competencia).toBe("2026-12");
    expect(r.data).toEqual(novembro.data);
  });

  it("novo dia move a data dentro do mês da recorrência e recalcula o ciclo", () => {
    const r = camposDoLancamentoFuturo(novembro, { ...base, novoDiaDoMes: 5 }, aPartirDe);
    expect(r.data.toISOString().slice(0, 10)).toBe("2026-11-05");
    expect(r.competencia).toBe("2026-11");
  });

  it("novo dia que já passou mantém a data (não vai para o passado)", () => {
    const outubro = { data: interpretarData("2026-10-25"), valorCentavos: 140000, competencia: "2026-10", mesRecorrencia: "2026-10" };
    const r = camposDoLancamentoFuturo(outubro, { ...base, formaPagamento: "PIX", cartao: null, carteiraId: "conta", novoDiaDoMes: 5 }, aPartirDe);
    expect(r.data).toEqual(outubro.data);
    expect(r.competencia).toBe("2026-10");
  });

  it("crédito → PIX: competência volta para o mês da recorrência, sem cartão, com carteira", () => {
    const r = camposDoLancamentoFuturo(novembro, { ...base, formaPagamento: "PIX", cartao: null, carteiraId: "conta" }, aPartirDe);
    expect(r.competencia).toBe("2026-11");
    expect(r.cartaoId).toBeNull();
    expect(r.carteiraId).toBe("conta");
    expect(r.formaPagamento).toBe("PIX");
  });

  it("valor só muda se o lançamento ainda tem o valor antigo", () => {
    expect(camposDoLancamentoFuturo(novembro, { ...base, valorCentavos: 6000 }, aPartirDe).valorCentavos).toBe(6000);
    expect(camposDoLancamentoFuturo({ ...novembro, valorCentavos: 4000 }, { ...base, valorCentavos: 6000 }, aPartirDe).valorCentavos).toBe(4000);
  });

  it("dia 31 vira o último dia do mês da recorrência", () => {
    const fevereiro = { data: interpretarData("2027-02-10"), valorCentavos: 100, competencia: "2027-02", mesRecorrencia: "2027-02" };
    const r = camposDoLancamentoFuturo(fevereiro, { ...base, formaPagamento: "PIX", cartao: null, novoDiaDoMes: 31 }, aPartirDe);
    expect(r.data.toISOString().slice(0, 10)).toBe("2027-02-28");
  });
});
