import { describe, it, expect } from "vitest";
import { calcularResumo, CategoriaCalculo, diasRestantesNaCompetencia, LancamentoCalculo, movimentoVrDoMes, totaisDoMes } from "./resumo.calculo";
import { cicloDoCartao } from "../../shared/helpers/competencia.helper";

const VR = "carteira-vr";
const categoria = (id: string, grupo: CategoriaCalculo["grupo"]): CategoriaCalculo => ({ id, nome: id, icone: "i", cor: "#000", grupo, limiteMensalCentavos: null });
const categorias = [categoria("moradia", "ESSENCIAL"), categoria("mercado", "ESSENCIAL"), categoria("lazer", "DESEJO"), categoria("reserva", "POUPANCA")];

const entrada = (valorCentavos: number, carteiraId: string | null = "conta"): LancamentoCalculo => ({ tipo: "ENTRADA", valorCentavos, formaPagamento: "PIX", carteiraId, categoriaId: null });
const saida = (valorCentavos: number, categoriaId: string | null, formaPagamento = "PIX", carteiraId: string | null = "conta"): LancamentoCalculo => ({ tipo: "SAIDA", valorCentavos, formaPagamento, carteiraId, categoriaId });

const resumo = (lancamentos: LancamentoCalculo[], datas: { competencia?: string; competenciaAtual?: string; diaDeHoje?: number } = {}) =>
  calcularResumo({ competencia: "2026-10", competenciaAtual: "2026-10", diaDeHoje: 21, categorias, carteirasVrIds: [VR], lancamentos, ...datas });

describe("totaisDoMes / VR", () => {
  const lancamentos = [entrada(500000), entrada(80000, VR), saida(150000, "moradia"), saida(3000, "mercado", "VR", VR)];

  it("entrada na carteira VR fica fora das entradas", () => expect(totaisDoMes(lancamentos, [VR]).entradasCentavos).toBe(500000));

  it("saída paga com VR fica fora das saídas", () => expect(totaisDoMes(lancamentos, [VR]).saidasCentavos).toBe(150000));

  it("sobra = entradas - saídas (sem VR)", () => expect(totaisDoMes(lancamentos, [VR]).sobraCentavos).toBe(350000));

  it("movimento do VR traz entradas e saídas da carteira VR", () =>
    expect(movimentoVrDoMes(lancamentos, VR)).toEqual({ entradasMesCentavos: 80000, saidasMesCentavos: 3000 }));

  it("gasto no VR não aparece em porCategoria nem em porGrupo", () => {
    const r = resumo(lancamentos);
    expect(r.porCategoria.map((c) => c.categoriaId)).toEqual(["moradia"]);
    expect(r.porGrupo.ESSENCIAL).toBe(150000);
  });
});

describe("calcularResumo", () => {
  it("compra no crédito conta na competência da fatura (cartão fecha 10, vence 17)", () => {
    // A competência vem do ciclo do cartão; o repositório filtra os lançamentos por ela.
    const competencia = cicloDoCartao(new Date("2026-10-15T15:00:00.000Z"), 10, 17).competencia;
    expect(competencia).toBe("2026-11");
    const r = resumo([entrada(400000), saida(25000, "lazer", "CREDITO", null)], { competencia });
    expect(r.saidasCentavos).toBe(25000);
    expect(r.competencia).toBe("2026-11");
  });

  it("sobra e comprometidoPct", () => {
    const r = resumo([entrada(400000), saida(100000, "moradia"), saida(50000, "lazer", "CREDITO", null)]);
    expect(r.sobraCentavos).toBe(250000);
    expect(r.comprometidoPct).toBeCloseTo(37.5);
  });

  it("comprometidoPct é 0 quando não há entradas (sem divisão por zero)", () => {
    const r = resumo([saida(10000, "lazer")]);
    expect(r.comprometidoPct).toBe(0);
    expect(r.sobraCentavos).toBe(-10000);
  });

  it("comprometidoPct passa de 100 quando gasta mais do que entra", () =>
    expect(resumo([entrada(1000), saida(1500, "lazer")]).comprometidoPct).toBeCloseTo(150));

  it("mês atual: podeGastarPorDia = floor(sobra / diasRestantes)", () => {
    // 21/10: faltam 11 dias contando hoje.
    const r = resumo([entrada(100000)]);
    expect(r.diasRestantes).toBe(11);
    expect(r.podeGastarPorDiaCentavos).toBe(9090);
  });

  it("podeGastarPorDia = 0 com sobra negativa", () =>
    expect(resumo([entrada(1000), saida(5000, "lazer")]).podeGastarPorDiaCentavos).toBe(0));

  it("podeGastarPorDia = 0 com sobra zero", () => expect(resumo([entrada(5000), saida(5000, "lazer")]).podeGastarPorDiaCentavos).toBe(0));

  it("podeGastarPorDia = 0 em mês passado (dias 0)", () => {
    const r = resumo([entrada(100000)], { competencia: "2026-09" });
    expect(r.diasRestantes).toBe(0);
    expect(r.podeGastarPorDiaCentavos).toBe(0);
  });

  it("mês futuro usa o mês inteiro", () => {
    const r = resumo([entrada(300000)], { competencia: "2026-11" });
    expect(r.diasRestantes).toBe(30);
    expect(r.podeGastarPorDiaCentavos).toBe(10000);
  });

  it("porCategoria soma por categoria e ordena do maior para o menor", () => {
    const r = resumo([saida(1000, "lazer"), saida(9000, "moradia"), saida(3000, "mercado"), saida(2500, "lazer"), saida(500, "reserva")]);
    expect(r.porCategoria.map((c) => [c.categoriaId, c.totalCentavos])).toEqual([
      ["moradia", 9000],
      ["lazer", 3500],
      ["mercado", 3000],
      ["reserva", 500],
    ]);
  });

  it("porCategoria ignora saída sem categoria ou com categoria desconhecida, mas elas contam nas saídas", () => {
    const r = resumo([saida(1000, null), saida(2000, "apagada"), saida(300, "lazer")]);
    expect(r.porCategoria.map((c) => c.categoriaId)).toEqual(["lazer"]);
    expect(r.saidasCentavos).toBe(3300);
  });

  it("porCategoria não inclui entradas", () => expect(resumo([{ ...entrada(1000), categoriaId: "lazer" }]).porCategoria).toEqual([]));

  it("porGrupo soma as categorias de cada grupo", () => {
    const r = resumo([saida(9000, "moradia"), saida(3000, "mercado"), saida(1000, "lazer"), saida(500, "reserva")]);
    expect(r.porGrupo).toEqual({ ESSENCIAL: 12000, DESEJO: 1000, POUPANCA: 500 });
  });

  it("sem lançamentos: tudo zerado", () => {
    const r = resumo([]);
    expect(r).toMatchObject({ entradasCentavos: 0, saidasCentavos: 0, sobraCentavos: 0, comprometidoPct: 0, podeGastarPorDiaCentavos: 0, porCategoria: [] });
    expect(r.porGrupo).toEqual({ ESSENCIAL: 0, DESEJO: 0, POUPANCA: 0 });
  });
});

describe("diasRestantesNaCompetencia", () => {
  it("mês atual conta o dia de hoje", () => expect(diasRestantesNaCompetencia("2026-10", "2026-10", 21)).toBe(11));
  it("último dia do mês atual: 1 dia", () => expect(diasRestantesNaCompetencia("2026-10", "2026-10", 31)).toBe(1));
  it("primeiro dia do mês atual: o mês todo", () => expect(diasRestantesNaCompetencia("2026-10", "2026-10", 1)).toBe(31));
  it("mês passado: 0", () => expect(diasRestantesNaCompetencia("2026-09", "2026-10", 21)).toBe(0));
  it("ano passado: 0", () => expect(diasRestantesNaCompetencia("2025-12", "2026-01", 5)).toBe(0));
  it("mês futuro: dias do mês", () => expect(diasRestantesNaCompetencia("2027-02", "2026-10", 21)).toBe(28));
  it("fevereiro bissexto futuro: 29", () => expect(diasRestantesNaCompetencia("2028-02", "2026-10", 21)).toBe(29));
});
