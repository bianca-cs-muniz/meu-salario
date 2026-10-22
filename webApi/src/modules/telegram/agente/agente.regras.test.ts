import { describe, it, expect, vi } from "vitest";
import { categoriasPadrao } from "@modulos/categorias/categorias.padrao";
import { interpretar, lerValorCentavos, resolverCategoria, resolverCartao, lerData, DATA_INVALIDA, ContextoRegras } from "./agente.regras";

const ctx: ContextoRegras = {
  hoje: "2026-10-22",
  categorias: categoriasPadrao.map((c) => ({ nome: c.nome })),
  cartoes: [{ nome: "Nubank" }, { nome: "Inter" }],
};

type Esperado = {
  tipo: "ENTRADA" | "SAIDA";
  valorCentavos: number;
  descricao: string;
  categoriaNome: string | null;
  formaPagamento: "PIX" | "DEBITO" | "CREDITO" | "VR" | "DINHEIRO" | null;
  cartaoNome?: string | null;
  parcelas?: number | null;
  data?: string | null;
};

const lancamento = (e: Esperado) => ({
  intencao: "REGISTRAR",
  consulta: null,
  lancamento: { cartaoNome: null, parcelas: null, data: null, duvida: null, ...e },
});
const DESCONHECIDO = { intencao: "DESCONHECIDO", lancamento: null, consulta: null };
const consulta = (intencao: string, categoriaNome: string | null = null, cartaoNome: string | null = null) => ({
  intencao,
  lancamento: null,
  consulta: { categoriaNome, cartaoNome, competencia: null },
});
const semCampos = (intencao: string) => ({ intencao, lancamento: null, consulta: null });

const saida = (valorCentavos: number, descricao: string, categoriaNome: string | null, formaPagamento: Esperado["formaPagamento"], extra: Partial<Esperado> = {}) =>
  lancamento({ tipo: "SAIDA", valorCentavos, descricao, categoriaNome, formaPagamento, ...extra });
const entrada = (valorCentavos: number, descricao: string, formaPagamento: Esperado["formaPagamento"]) =>
  lancamento({ tipo: "ENTRADA", valorCentavos, descricao, categoriaNome: null, formaPagamento });

describe("interpretar: saídas", () => {
  it.each([
    ["debito farmacia 2,90", saida(290, "Farmacia", "Saúde", "DEBITO")],
    ["Débito Farmácia 2,90", saida(290, "Farmácia", "Saúde", "DEBITO")],
    ["debito farmacia R$ 2,90", saida(290, "Farmacia", "Saúde", "DEBITO")],
    ["debito farmacia R$2,90", saida(290, "Farmacia", "Saúde", "DEBITO")],
    ["debito padaria 2.90", saida(290, "Padaria", "Comida", "DEBITO")],
    ["debito padaria 2,9", saida(290, "Padaria", "Comida", "DEBITO")],
    ["debito padaria 1,400", DESCONHECIDO],
    ["pix aluguel 1.400,00", saida(140000, "Aluguel", "Moradia", "PIX")],
    ["pix aluguel 1.400", saida(140000, "Aluguel", "Moradia", "PIX")],
    ["pix aluguel 1400", saida(140000, "Aluguel", "Moradia", "PIX")],
    ["pix uber 18,50", saida(1850, "Uber", "Transporte", "PIX")],
    ["dinheiro feira 30", saida(3000, "Feira", "Mercado", "DINHEIRO")],
    ["dinheiro pastel 8", saida(800, "Pastel", null, "DINHEIRO")],
    ["credito ifood 45", saida(4500, "Ifood", "Comida", "CREDITO")],
    ["cartao ifood 45", saida(4500, "Ifood", "Comida", "CREDITO")],
    ["crédito ifood 45 no NUBANK", saida(4500, "Ifood", "Comida", "CREDITO", { cartaoNome: "Nubank" })],
    ["credito ifood 45 nubank", saida(4500, "Ifood", "Comida", "CREDITO", { cartaoNome: "Nubank" })],
    ["credito ifood 45 no c6", saida(4500, "Ifood", "Comida", "CREDITO", { cartaoNome: "c6" })],
    ["credito ifood 45 em 3x no inter", saida(4500, "Ifood", "Comida", "CREDITO", { cartaoNome: "Inter", parcelas: 3 })],
    ["vr mercado 230", saida(23000, "Mercado", "Mercado", "VR")],
    ["va mercado 230", saida(23000, "Mercado", "Mercado", "VR")],
    ["pix uber 99 12,50", saida(1250, "Uber 99", "Transporte", "PIX")],
    ["debito 99 12", saida(1200, "99", "Transporte", "DEBITO")],
    ["debito remedios 30", saida(3000, "Remedios", "Saúde", "DEBITO")],
    ["debito contas da casa 150", saida(15000, "Contas da casa", "Contas da casa", "DEBITO")],
    ["debito assinatura 20", saida(2000, "Assinatura", "Assinaturas", "DEBITO")],
    ["debito presente da ana 80", saida(8000, "Presente da ana", null, "DEBITO")],
    ["debito farmacia 2,90 ontem", saida(290, "Farmacia", "Saúde", "DEBITO", { data: "2026-10-21" })],
    ["debito farmacia 2,90 20/10", saida(290, "Farmacia", "Saúde", "DEBITO", { data: "2026-10-20" })],
    ["debito farmacia 2,90 30/12", saida(290, "Farmacia", "Saúde", "DEBITO", { data: "2025-12-30" })],
    ["debito farmacia 2,90 31/02", DESCONHECIDO],
    ["debito farmacia 2,90 no nubank", DESCONHECIDO],
    ["debito farmacia 2,90!", saida(290, "Farmacia", "Saúde", "DEBITO")],
    ["debito farmacia 0", saida(0, "Farmacia", "Saúde", "DEBITO")],
    ["debito farmacia", DESCONHECIDO],
    ["debito", DESCONHECIDO],
    ["debito R$ 45", DESCONHECIDO],
    ["pix 50", DESCONHECIDO],
    ["dinheiro", DESCONHECIDO],
  ])("%s", (texto, esperado) => {
    expect(interpretar(texto, ctx)).toEqual(esperado);
  });
});

describe("interpretar: parcelamentos", () => {
  it.each([
    ["parcelamento 300 em 2x no nubank", saida(30000, "Parcelamento", null, "CREDITO", { cartaoNome: "Nubank", parcelas: 2 })],
    ["parcelamento tenis 600 em 3x no nubank", saida(60000, "Tenis", "Roupa", "CREDITO", { cartaoNome: "Nubank", parcelas: 3 })],
    ["Parcelamento Tênis 1.200,00 em 12X no Inter", saida(120000, "Tênis", "Roupa", "CREDITO", { cartaoNome: "Inter", parcelas: 12 })],
    ["parcelamento tenis 600 em 3 x", saida(60000, "Tenis", "Roupa", "CREDITO", { parcelas: 3 })],
    ["parcelamento tenis 600 em 60x no nubank", saida(60000, "Tenis", "Roupa", "CREDITO", { cartaoNome: "Nubank", parcelas: 60 })],
    ["parcelamento tenis 600", DESCONHECIDO],
  ])("%s", (texto, esperado) => {
    expect(interpretar(texto, ctx)).toEqual(esperado);
  });
});

describe("interpretar: entradas", () => {
  it.each([
    ["entrada salario 4500", entrada(450000, "Salario", null)],
    ["Entrada Salário 4.500,00", entrada(450000, "Salário", null)],
    ["recebi freela 500", entrada(50000, "Freela", null)],
    ["entrada pix freela 500", entrada(50000, "Freela", "PIX")],
    ["pix entrada freela 500", entrada(50000, "Freela", "PIX")],
    ["entrada dinheiro venda bolo 60", entrada(6000, "Venda bolo", "DINHEIRO")],
    ["entrada vr 800", entrada(80000, "Crédito do VR", "VR")],
    ["entrada vr recarga 800", entrada(80000, "Recarga", "VR")],
    ["vr entrada recarga 800", entrada(80000, "Recarga", "VR")],
    ["entrada credito estorno 50", DESCONHECIDO],
    ["entrada 4500", DESCONHECIDO],
    ["entrada salario", DESCONHECIDO],
  ])("%s", (texto, esperado) => {
    expect(interpretar(texto, ctx)).toEqual(esperado);
  });
});

describe("interpretar: consultas e ações", () => {
  it.each([
    ["sobra", consulta("CONSULTAR_SOBRA")],
    ["/sobra", consulta("CONSULTAR_SOBRA")],
    ["/sobra@MeuBot", consulta("CONSULTAR_SOBRA")],
    ["Sobra?", consulta("CONSULTAR_SOBRA")],
    ["sobrou", consulta("CONSULTAR_SOBRA")],
    ["quanto sobrou", consulta("CONSULTAR_SOBRA")],
    ["Quanto sobra?", consulta("CONSULTAR_SOBRA")],
    ["fatura", consulta("CONSULTAR_FATURA")],
    ["/fatura", consulta("CONSULTAR_FATURA")],
    ["fatura nubank", consulta("CONSULTAR_FATURA", null, "Nubank")],
    ["/fatura Nubank", consulta("CONSULTAR_FATURA", null, "Nubank")],
    ["fatura do nubank?", consulta("CONSULTAR_FATURA", null, "Nubank")],
    ["gasto mercado", consulta("CONSULTAR_CATEGORIA", "Mercado")],
    ["/gasto Mercado", consulta("CONSULTAR_CATEGORIA", "Mercado")],
    ["gastos com comida?", consulta("CONSULTAR_CATEGORIA", "Comida")],
    ["gasto farmacia", consulta("CONSULTAR_CATEGORIA", "Saúde")],
    ["gastos", consulta("CONSULTAR_CATEGORIA")],
    ["/gasto", consulta("CONSULTAR_CATEGORIA")],
    ["gasto mercado 50", null],
    ["apaga", semCampos("APAGAR_ULTIMO")],
    ["apagar", semCampos("APAGAR_ULTIMO")],
    ["Apaga o último", semCampos("APAGAR_ULTIMO")],
    ["apagar ultimo", semCampos("APAGAR_ULTIMO")],
    ["/apagar", semCampos("APAGAR_ULTIMO")],
    ["desfaz", semCampos("APAGAR_ULTIMO")],
    ["desfazer", semCampos("APAGAR_ULTIMO")],
    ["ajuda", semCampos("AJUDA")],
    ["/ajuda", semCampos("AJUDA")],
    ["/help", semCampos("AJUDA")],
    ["?", semCampos("AJUDA")],
    ["comandos", semCampos("AJUDA")],
    ["menu", semCampos("AJUDA")],
  ])("%s", (texto, esperado) => {
    expect(interpretar(texto, ctx)).toEqual(esperado);
  });
});

describe("interpretar: texto livre vai ao Claude (null)", () => {
  it.each(["45", "farmacia 2,90", "bom dia", "quanto gastei ontem no mercado?", "/xyz"])("%s", (texto) => {
    expect(interpretar(texto, ctx)).toBeNull();
  });
});

describe("lerValorCentavos", () => {
  it.each([
    ["2,90", 290],
    ["2,9", 290],
    ["2.90", 290],
    ["45", 4500],
    ["0", 0],
    ["1400", 140000],
    ["1.400", 140000],
    ["1.400,00", 140000],
    ["1.234.567,89", 123456789],
    ["R$2,90", 290],
    ["r$45", 4500],
    ["9999999999", 999999999900],
    ["1,400", null],
    ["12345678901", null],
    ["2,901", null],
    ["1.40.0", null],
    ["abc", null],
    ["3x", null],
    ["", null],
    ["-5", null],
  ])("%s → %s", (token, esperado) => {
    expect(lerValorCentavos(token)).toBe(esperado);
  });
});

describe("resolverCategoria", () => {
  const cats = ctx.categorias;
  it.each([
    ["Mercado", "Mercado"],
    ["mercados", "Mercado"],
    ["assinatura", "Assinaturas"],
    ["contas da casa", "Contas da casa"],
    ["conta de luz", "Contas da casa"],
    ["mercado do bairro", "Mercado"],
    ["uber 99", "Transporte"],
    ["remédios", "Saúde"],
    ["educacao", "Educação"],
    ["presente da ana", null],
    ["", null],
  ])("%s → %s", (descricao, esperado) => {
    expect(resolverCategoria(descricao, cats)).toBe(esperado);
  });

  it("sinônimo só vale se a categoria existir", () => {
    expect(resolverCategoria("farmacia", [{ nome: "Mercado" }])).toBeNull();
  });

  it("devolve o nome como está na lista", () => {
    expect(resolverCategoria("farmacia", [{ nome: "SAUDE" }])).toBe("SAUDE");
  });
});

describe("resolverCartao", () => {
  const cartoes = [{ nome: "Nubank" }, { nome: "Inter" }, { nome: "Itaú" }];
  it.each([
    ["NUBANK", "Nubank"],
    ["nu", "Nubank"],
    ["itau", "Itaú"],
    ["i", "i"],
    ["c6", "c6"],
    ["  ", null],
  ])("%s → %s", (texto, esperado) => {
    expect(resolverCartao(texto, cartoes)).toBe(esperado);
  });
});

describe("lerData", () => {
  it.each([
    ["hoje", "2026-10-22"],
    ["ontem", "2026-10-21"],
    ["Ontem", "2026-10-21"],
    ["20/10", "2026-10-20"],
    ["22/10", "2026-10-22"],
    ["23/10", "2025-10-23"],
    ["30/12", "2025-12-30"],
    ["1/1", "2026-01-01"],
    ["31/02", DATA_INVALIDA],
    ["10/13", DATA_INVALIDA],
    ["00/10", DATA_INVALIDA],
    ["amanha", null],
    ["2,90", null],
  ])("%s → %s", (token, esperado) => {
    expect(lerData(token, "2026-10-22")).toBe(esperado);
  });

  it("ontem na virada do ano", () => {
    expect(lerData("ontem", "2026-01-01")).toBe("2025-12-31");
  });
});

describe("determinismo", () => {
  it("mesma entrada, mesma saída, sem consultar o relógio", () => {
    const relogio = vi.spyOn(Date, "now");
    const textos = ["debito farmacia 2,90 ontem", "parcelamento tenis 600 em 3x no nubank", "entrada vr 800", "sobra", "bom dia"];
    const primeira = textos.map((t) => interpretar(t, ctx));
    const segunda = textos.map((t) => interpretar(t, ctx));
    expect(segunda).toEqual(primeira);
    expect(relogio).not.toHaveBeenCalled();
    relogio.mockRestore();
  });
});
