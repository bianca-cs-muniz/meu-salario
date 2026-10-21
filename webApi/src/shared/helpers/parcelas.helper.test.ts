import { describe, it, expect } from "vitest";
import { descricaoDaParcela, dividirEmParcelas } from "./parcelas.helper";

const soma = (valores: number[]) => valores.reduce((a, b) => a + b, 0);

describe("dividirEmParcelas", () => {
  it("10000 em 3x fica 3334, 3333, 3333 (resto na 1ª)", () => {
    const parcelas = dividirEmParcelas("TV", 10000, 3, "2026-10");
    expect(parcelas.map((p) => p.valorCentavos)).toEqual([3334, 3333, 3333]);
  });

  it.each([
    [10000, 3],
    [9999, 7],
    [1, 1],
    [123457, 12],
    [2_147_483_647, 48],
  ])("soma das parcelas de %i em %ix é igual ao total", (total, quantidade) => {
    const parcelas = dividirEmParcelas("Compra", total, quantidade, "2026-10");
    expect(parcelas).toHaveLength(quantidade);
    expect(soma(parcelas.map((p) => p.valorCentavos))).toBe(total);
  });

  it("todas as parcelas são inteiras e só a 1ª pode ser maior", () => {
    const parcelas = dividirEmParcelas("Compra", 10007, 4, "2026-10");
    expect(parcelas.every((p) => Number.isInteger(p.valorCentavos))).toBe(true);
    expect(parcelas.slice(1).every((p) => p.valorCentavos === parcelas[1].valorCentavos)).toBe(true);
    expect(parcelas[0].valorCentavos - parcelas[1].valorCentavos).toBe(3);
  });

  it("1x devolve uma parcela sem sufixo, com o valor inteiro e na competência informada", () => {
    expect(dividirEmParcelas("Mercado", 5000, 1, "2026-10")).toEqual([
      { numero: 1, total: 1, descricao: "Mercado", valorCentavos: 5000, competencia: "2026-10" },
    ]);
  });

  it("12x a partir de novembro atravessa o ano, uma competência por mês", () => {
    const competencias = dividirEmParcelas("Notebook", 120000, 12, "2026-11").map((p) => p.competencia);
    expect(competencias).toEqual([
      "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04",
      "2027-05", "2027-06", "2027-07", "2027-08", "2027-09", "2027-10",
    ]);
  });

  it("descrição de cada parcela leva o sufixo (k/n) e numero/total corretos", () => {
    const parcelas = dividirEmParcelas("Geladeira", 30000, 3, "2026-10");
    expect(parcelas.map((p) => p.descricao)).toEqual(["Geladeira (1/3)", "Geladeira (2/3)", "Geladeira (3/3)"]);
    expect(parcelas.map((p) => [p.numero, p.total])).toEqual([[1, 3], [2, 3], [3, 3]]);
  });

  // Comportamento documentado: valor menor que a quantidade gera parcelas de 0 centavos
  // (floor = 0 e todo o resto vai para a 1ª). A função não rejeita esse caso.
  it("2 centavos em 3x: 1ª parcela leva 2 e as demais ficam com 0", () => {
    const parcelas = dividirEmParcelas("Chiclete", 2, 3, "2026-10");
    expect(parcelas.map((p) => p.valorCentavos)).toEqual([2, 0, 0]);
    expect(soma(parcelas.map((p) => p.valorCentavos))).toBe(2);
  });

  it("quantidade 0 ou negativa vira 1 parcela", () => {
    expect(dividirEmParcelas("X", 100, 0, "2026-10")).toHaveLength(1);
    expect(dividirEmParcelas("X", 100, -5, "2026-10")).toHaveLength(1);
  });

  it("quantidade fracionária é arredondada para baixo", () => {
    const parcelas = dividirEmParcelas("X", 100, 2.9, "2026-10");
    expect(parcelas.map((p) => p.valorCentavos)).toEqual([50, 50]);
  });
});

describe("descricaoDaParcela", () => {
  it("acrescenta o sufixo (k/n)", () => expect(descricaoDaParcela("Sofá", 2, 10)).toBe("Sofá (2/10)"));

  it("troca um sufixo (k/n) que já existia, sem duplicar", () =>
    expect(descricaoDaParcela("Sofá (1/10)", 3, 12)).toBe("Sofá (3/12)"));

  it("não mexe em parênteses que não estão no fim", () =>
    expect(descricaoDaParcela("Sofá (1/10) sala", 2, 3)).toBe("Sofá (1/10) sala (2/3)"));
});
