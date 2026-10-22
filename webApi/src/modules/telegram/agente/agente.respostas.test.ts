import { describe, it, expect } from "vitest";
import Respostas, { ResumoLancado } from "./agente.respostas";

// Intl usa espaço não separável depois do "R$": normaliza para comparar.
const n = (texto: string) => texto.replace(/ /g, " ");

const impacto = { sobraCentavos: 150000, faturaTotalCentavos: null, faturaCompetencia: null, saldoVrCentavos: null, saldoInsuficiente: false };
const base: ResumoLancado = {
  tipo: "SAIDA",
  descricao: "Mercado",
  valorCentavos: 23000,
  formaPagamento: "VR",
  categoriaNome: "Mercado",
  cartaoNome: null,
  parcelas: 1,
  revisado: true,
  motivos: [],
  impacto: { ...impacto, saldoVrCentavos: 57000 },
};

describe("Respostas.lancado", () => {
  it("VR mostra o saldo do VR", () => {
    expect(n(Respostas.lancado(base))).toBe("Anotado: Mercado R$ 230,00 · VR (Mercado).\nSaldo do VR: R$ 570,00");
  });

  it("VR negativo avisa", () => {
    const texto = Respostas.lancado({ ...base, impacto: { ...base.impacto, saldoVrCentavos: -1000, saldoInsuficiente: true } });
    expect(n(texto)).toContain("Saldo do VR: -R$ 10,00 (ficou negativo!)");
  });

  it("crédito parcelado mostra cartão, parcelas e fatura", () => {
    const texto = Respostas.lancado({
      ...base,
      descricao: "Tênis",
      valorCentavos: 30000,
      formaPagamento: "CREDITO",
      cartaoNome: "Nubank",
      categoriaNome: "Roupa",
      parcelas: 3,
      impacto: { ...impacto, faturaTotalCentavos: 100000, faturaCompetencia: "2026-11" },
    });
    expect(n(texto)).toBe("Anotado: Tênis R$ 300,00 · Crédito Nubank em 3x (Roupa).\nFatura de 11/2026: R$ 1.000,00");
  });

  it("débito pendente mostra sobra e motivo", () => {
    const texto = Respostas.lancado({ ...base, formaPagamento: "DEBITO", revisado: false, motivos: ["Não sei se foi débito ou crédito."], impacto });
    expect(n(texto)).toBe("Anotado: Mercado R$ 230,00 · Débito (Mercado).\nSobra do mês: R$ 1.500,00\nDeixei em Pendências: Não sei se foi débito ou crédito.");
  });

  it("entrada", () => {
    const texto = Respostas.lancado({ ...base, tipo: "ENTRADA", descricao: "Salário", valorCentavos: 350000, formaPagamento: "PIX", categoriaNome: null, impacto });
    expect(n(texto)).toBe("Entrada anotada: Salário R$ 3.500,00 · Pix.\nSobra do mês: R$ 1.500,00");
  });
});

describe("consultas", () => {
  it("sobra", () => {
    const texto = Respostas.sobra({ competencia: "2026-10", sobraCentavos: 100000, diasRestantes: 10, podeGastarPorDiaCentavos: 10000, pendencias: 2 });
    expect(n(texto)).toBe("Sobra de 10/2026: R$ 1.000,00.\nFaltam 10 dia(s): dá para gastar R$ 100,00 por dia.\nVocê tem 2 lançamento(s) em Pendências para conferir no app.");
  });

  it("sobra negativa", () => {
    const texto = Respostas.sobra({ competencia: "2026-10", sobraCentavos: -500, diasRestantes: 3, podeGastarPorDiaCentavos: 0, pendencias: 0 });
    expect(n(texto)).toContain("não sobra nada");
  });

  it("categoria com limite", () => {
    expect(n(Respostas.categoria({ nome: "Comida", gastoCentavos: 40000, limiteMensalCentavos: 50000, competencia: "2026-10" }))).toBe(
      "Comida em 10/2026: R$ 400,00 de R$ 500,00 (restam R$ 100,00).",
    );
    expect(n(Respostas.categoria({ nome: "Comida", gastoCentavos: 60000, limiteMensalCentavos: 50000, competencia: "2026-10" }))).toContain("passou R$ 100,00");
    expect(n(Respostas.categoria({ nome: "Lazer", gastoCentavos: 1000, limiteMensalCentavos: null, competencia: "2026-10" }))).toBe("Lazer em 10/2026: R$ 10,00.");
  });

  it("fatura", () => {
    const texto = Respostas.fatura({
      nome: "Nubank",
      limiteCentavos: 500000,
      limiteUsadoCentavos: 120000,
      faturaAtual: { totalCentavos: 120000, vencimento: "2026-11-10T15:00:00.000Z", status: "ABERTA", competencia: "2026-11" },
    });
    expect(n(texto)).toBe("Fatura Nubank (vence 10/11): R$ 1.200,00, aberta.\nLimite usado: R$ 1.200,00 de R$ 5.000,00.");
  });

  it("apagado simples e parcelado", () => {
    expect(n(Respostas.apagado({ descricao: "Uber", valorCentavos: 1850, data: "2026-10-22T15:00:00Z", parcelas: null }))).toBe("Apaguei: Uber R$ 18,50 (22/10).");
    expect(n(Respostas.apagado({ descricao: "Tênis", valorCentavos: 30000, data: "2026-10-22T15:00:00Z", parcelas: 3 }))).toBe(
      'Apaguei a compra parcelada "Tênis" (3 parcelas, total R$ 300,00).',
    );
  });
});

describe("textos fixos", () => {
  it("conectado traz o nome e exemplos", () => {
    const texto = Respostas.conectado("Bianca");
    expect(texto.startsWith("Conectado, Bianca!")).toBe(true);
    expect(texto).toContain("• vr mercado 230");
    expect(texto).toContain("• debito farmacia 2,90");
  });

  it("ajuda ensina o formato, as formas, a data e os comandos", () => {
    const texto = Respostas.ajuda();
    expect(texto.startsWith("Escreva assim: forma, o que foi, valor.")).toBe(true);
    for (const forma of ["debito", "credito", "pix", "dinheiro", "vr"]) expect(texto).toContain(forma);
    expect(texto).toContain("ontem");
    expect(texto).toContain("20/10");
    for (const exemplo of ["parcelamento tenis 600 em 3x no nubank", "entrada salario 4500", "entrada vr 800", "fatura nubank", "apaga"]) {
      expect(texto).toContain(`• ${exemplo}`);
    }
    expect(texto).toContain("/sobra, /fatura, /gasto, /apagar, /ajuda e /desconectar");
  });

  it("formato e desconhecido", () => {
    expect(Respostas.FORMATO).toBe("Não entendi. Use: debito farmacia 2,90 · credito ifood 45 · vr mercado 230 · parcelamento 300 em 2x no nubank");
    expect(Respostas.desconhecido()).toBe(Respostas.FORMATO);
    expect(Respostas).not.toHaveProperty("SEM_CEREBRO");
    expect(Respostas.SO_TEXTO).toContain("debito mercado 45");
  });

  it("instrução para chat não vinculado e link expirado", () => {
    expect(Respostas.NAO_VINCULADO).toContain("Abra Configurações no app Meu Salário e toque em Conectar Telegram");
    expect(Respostas.LINK_EXPIRADO).toBe("Esse link expirou. Abra Configurações no app e toque em Conectar Telegram.");
  });

  it("limites", () => {
    expect(Respostas.limite("JANELA")).toMatch(/muitas mensagens/);
    expect(Respostas.limite("DIA")).toMatch(/limite/);
    expect(Respostas.limite("GLOBAL")).toMatch(/ocupado/);
  });
});
