import { describe, it, expect } from "vitest";
import { competenciaNaEdicao, ItemEdicao } from "./lancamentos.calculo";
import { interpretarData } from "../../shared/helpers/competencia.helper";

// Cartão que fecha 10 e vence 17: compra de 15/10 cai na fatura de 2026-11.
const cartao = { diaFechamento: 10, diaVencimento: 17 };
const avulso: ItemEdicao = { competencia: "2026-10", formaPagamento: "PIX", cartaoId: null, grupoParcelaId: null, recorrenciaId: null, mesRecorrencia: null };
const fixoPix: ItemEdicao = { ...avulso, recorrenciaId: "r1", mesRecorrencia: "2026-10" };
const fixoCredito: ItemEdicao = { ...fixoPix, formaPagamento: "CREDITO", cartaoId: "c1", competencia: "2026-11" };

describe("competenciaNaEdicao", () => {
  it("avulso fora do crédito segue o mês da data", () =>
    expect(competenciaNaEdicao(avulso, { data: interpretarData("2026-11-01"), cartao: null, cartaoId: null, dataInformada: true })).toBe("2026-11"));

  it("fixo fora do crédito: mudar a data para outro mês não muda a competência", () =>
    expect(competenciaNaEdicao(fixoPix, { data: interpretarData("2026-11-01"), cartao: null, cartaoId: null, dataInformada: true })).toBe("2026-10"));

  it("cenário A: fixo PIX editado para CREDITO segue o ciclo do cartão", () =>
    expect(competenciaNaEdicao(fixoPix, { data: interpretarData("2026-10-15"), cartao, cartaoId: "c1", dataInformada: false })).toBe("2026-11"));

  it("cenário B: fixo no crédito editado para PIX volta para o mês da cobrança", () =>
    expect(competenciaNaEdicao(fixoCredito, { data: interpretarData("2026-10-15"), cartao: null, cartaoId: null, dataInformada: false })).toBe("2026-10"));

  it("fixo fora do crédito sem mesRecorrencia mantém a competência atual", () =>
    expect(competenciaNaEdicao({ ...fixoPix, mesRecorrencia: null, competencia: "2026-09" }, { data: interpretarData("2026-10-15"), cartao: null, cartaoId: null, dataInformada: true })).toBe("2026-09"));

  it("fixo no crédito: trocar de cartão recalcula pelo ciclo do novo cartão", () =>
    expect(
      competenciaNaEdicao(fixoCredito, { data: interpretarData("2026-10-15"), cartao: { diaFechamento: 20, diaVencimento: 28 }, cartaoId: "c2", dataInformada: false }),
    ).toBe("2026-10"));

  it("fixo no crédito: mudar a data recalcula pelo ciclo", () =>
    expect(competenciaNaEdicao(fixoCredito, { data: interpretarData("2026-11-12"), cartao, cartaoId: "c1", dataInformada: true })).toBe("2026-12"));

  it("crédito sem mudança de data, cartão ou forma mantém a competência", () =>
    expect(competenciaNaEdicao({ ...fixoCredito, competencia: "2026-12" }, { data: interpretarData("2026-10-15"), cartao, cartaoId: "c1", dataInformada: false })).toBe("2026-12"));

  it("parcela no crédito mantém a competência", () =>
    expect(
      competenciaNaEdicao({ ...avulso, formaPagamento: "CREDITO", cartaoId: "c1", grupoParcelaId: "g1", competencia: "2027-01" }, { data: interpretarData("2026-10-15"), cartao, cartaoId: "c1", dataInformada: true }),
    ).toBe("2027-01"));
});
