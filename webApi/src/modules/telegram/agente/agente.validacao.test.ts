import { describe, it, expect } from "vitest";
import { ContextoValidacao, LancamentoValidado, normalizarNome, validarLancamento } from "./agente.validacao";
import type { Extracao, LancamentoExtraido } from "./agente.extracao";

const categorias = [
  { id: "cat-mercado", nome: "Mercado", aceitaVr: true },
  { id: "cat-comida", nome: "Comida", aceitaVr: true },
  { id: "cat-saude", nome: "Saúde", aceitaVr: false },
  { id: "cat-transporte", nome: "Transporte", aceitaVr: false },
  { id: "cat-outros", nome: "Outros", aceitaVr: false },
];

const contexto = (extra: Partial<ContextoValidacao> = {}): ContextoValidacao => ({
  mensagem: "mercado 230 no vr",
  hoje: "2026-10-22",
  categorias,
  cartoes: [{ id: "car-nubank", nome: "Nubank" }],
  temCarteiraVr: true,
  ...extra,
});

const lancamento = (extra: Partial<LancamentoExtraido> = {}): Extracao => ({
  intencao: "REGISTRAR",
  consulta: null,
  lancamento: {
    tipo: "SAIDA",
    valorCentavos: 23000,
    descricao: "Mercado",
    categoriaNome: "Mercado",
    formaPagamento: "VR",
    cartaoNome: null,
    parcelas: null,
    data: null,
    duvida: null,
    ...extra,
  },
});

function ok(extracao: Extracao, ctx = contexto()): LancamentoValidado {
  const r = validarLancamento(extracao, ctx);
  if (!("ok" in r)) throw new Error(`esperava ok, veio pergunta: ${r.perguntar}`);
  return r.ok;
}

function pergunta(extracao: Extracao, ctx = contexto()): string {
  const r = validarLancamento(extracao, ctx);
  if (!("perguntar" in r)) throw new Error("esperava pergunta");
  return r.perguntar;
}

describe("validarLancamento", () => {
  it("gasto completo vira lançamento revisado", () => {
    const r = ok(lancamento());
    expect(r.dto).toEqual({ tipo: "SAIDA", descricao: "Mercado", valorCentavos: 23000, data: "2026-10-22", formaPagamento: "VR", categoriaId: "cat-mercado", parcelas: 1 });
    expect(r.revisado).toBe(true);
    expect(r.motivos).toEqual([]);
    expect(r.observacao).toBe('Mensagem: "mercado 230 no vr".');
    expect(r.categoriaNome).toBe("Mercado");
  });

  it("sem forma de pagamento → Débito e pendência", () => {
    const r = ok(lancamento({ formaPagamento: null, categoriaNome: "Transporte", descricao: "Uber" }));
    expect(r.dto.formaPagamento).toBe("DEBITO");
    expect(r.revisado).toBe(false);
    expect(r.motivos).toContain("Não sei se foi débito ou crédito.");
    expect(r.observacao).toContain("Não sei se foi débito ou crédito.");
  });

  it("entrada sem forma → Pix, sem pendência e sem categoria", () => {
    const r = ok(lancamento({ tipo: "ENTRADA", formaPagamento: null, categoriaNome: null, descricao: "Salário" }));
    expect(r.dto.formaPagamento).toBe("PIX");
    expect(r.dto.categoriaId).toBeUndefined();
    expect(r.revisado).toBe(true);
  });

  it("categoria inexistente → Outros com pendência", () => {
    const r = ok(lancamento({ categoriaNome: "Pet", formaPagamento: "PIX", descricao: "Ração" }));
    expect(r.dto.categoriaId).toBe("cat-outros");
    expect(r.revisado).toBe(false);
    expect(r.motivos).toContain("Coloquei em Outros; talvez seja Pet.");
  });

  it("sem categoria e sem 'Outros' → pergunta", () => {
    const semOutros = contexto({ categorias: categorias.filter((c) => c.nome !== "Outros") });
    expect(pergunta(lancamento({ categoriaNome: "Pet", formaPagamento: "PIX" }), semOutros)).toMatch(/^Em qual categoria\?/);
  });

  it("VR em categoria que não aceita VR → não lança e explica a regra", () => {
    const texto = pergunta(lancamento({ categoriaNome: "Transporte", descricao: "Uber" }));
    expect(texto).toContain("VR só vale para Mercado e Comida");
    expect(texto).toContain('"Transporte" não aceita VR');
  });

  it("VR sem carteira VR → não lança", () => {
    expect(pergunta(lancamento(), contexto({ temCarteiraVr: false }))).toBe("Cadastre a carteira VR no app antes de usar VR.");
  });

  it("crédito sem cartão citado e 1 cartão → usa ele sem dúvida", () => {
    const r = ok(lancamento({ formaPagamento: "CREDITO", categoriaNome: "Saúde" }));
    expect(r.dto.cartaoId).toBe("car-nubank");
    expect(r.revisado).toBe(true);
  });

  it("crédito sem cartão citado e 2 cartões → 1º ativo com pendência", () => {
    const ctx = contexto({ cartoes: [{ id: "car-nubank", nome: "Nubank" }, { id: "car-inter", nome: "Inter" }] });
    const r = ok(lancamento({ formaPagamento: "CREDITO", categoriaNome: "Saúde" }), ctx);
    expect(r.dto.cartaoId).toBe("car-nubank");
    expect(r.revisado).toBe(false);
    expect(r.motivos).toContain("Não sei em qual cartão; usei o Nubank.");
  });

  it("crédito com cartão citado (sem acento/maiúscula) e 2 cartões → acha o certo", () => {
    const ctx = contexto({ cartoes: [{ id: "car-nubank", nome: "Nubank" }, { id: "car-inter", nome: "Inter" }] });
    const r = ok(lancamento({ formaPagamento: "CREDITO", categoriaNome: "Saúde", cartaoNome: "INTER" }), ctx);
    expect(r.dto.cartaoId).toBe("car-inter");
    expect(r.revisado).toBe(true);
  });

  it("crédito com cartão citado que não existe → 1º ativo com pendência", () => {
    const r = ok(lancamento({ formaPagamento: "CREDITO", categoriaNome: "Saúde", cartaoNome: "Itaú" }));
    expect(r.dto.cartaoId).toBe("car-nubank");
    expect(r.revisado).toBe(false);
    expect(r.motivos[0]).toContain('Não achei o cartão "Itaú"');
  });

  it("crédito sem nenhum cartão → pergunta", () => {
    expect(pergunta(lancamento({ formaPagamento: "CREDITO", categoriaNome: "Saúde" }), contexto({ cartoes: [] }))).toMatch(/não tem cartão/);
  });

  it("parcelas no crédito", () => {
    const r = ok(lancamento({ formaPagamento: "CREDITO", categoriaNome: "Saúde", parcelas: 3 }));
    expect(r.dto.parcelas).toBe(3);
    expect(r.revisado).toBe(true);
  });

  it("parcelas fora do crédito → ignora com pendência", () => {
    const r = ok(lancamento({ formaPagamento: "PIX", parcelas: 3 }));
    expect(r.dto.parcelas).toBe(1);
    expect(r.revisado).toBe(false);
    expect(r.motivos).toContain("Parcelas só valem no crédito; anotei à vista.");
  });

  it("mais de 48 parcelas → pergunta", () => {
    expect(pergunta(lancamento({ formaPagamento: "CREDITO", categoriaNome: "Saúde", parcelas: 60 }))).toMatch(/até 48/);
  });

  it("data futura → hoje com pendência", () => {
    const r = ok(lancamento({ data: "2026-10-25" }));
    expect(r.dto.data).toBe("2026-10-22");
    expect(r.revisado).toBe(false);
  });

  it("data de ontem é mantida sem pendência", () => {
    const r = ok(lancamento({ data: "2026-10-21" }));
    expect(r.dto.data).toBe("2026-10-21");
    expect(r.revisado).toBe(true);
  });

  it("data antiga (> 60 dias) é mantida com pendência", () => {
    const r = ok(lancamento({ data: "2026-07-01" }));
    expect(r.dto.data).toBe("2026-07-01");
    expect(r.revisado).toBe(false);
    expect(r.motivos).toContain("Data de mais de 60 dias atrás: confere.");
  });

  it("data inválida → hoje com pendência", () => {
    const r = ok(lancamento({ data: "2026-02-31" }));
    expect(r.dto.data).toBe("2026-10-22");
    expect(r.revisado).toBe(false);
  });

  it.each([null, 0, -500])("valor %s → pergunta 'Quanto foi?'", (valor) => {
    expect(pergunta(lancamento({ valorCentavos: valor }))).toBe("Quanto foi?");
  });

  it("valor acima de R$ 50.000 → lança com pendência", () => {
    const r = ok(lancamento({ valorCentavos: 5_000_001 }));
    expect(r.revisado).toBe(false);
  });

  it("descrição longa é cortada em 120", () => {
    const r = ok(lancamento({ descricao: "x".repeat(300) }));
    expect(r.dto.descricao).toHaveLength(120);
  });

  it("descrição vazia vira 'Gasto'", () => {
    expect(ok(lancamento({ descricao: "   " })).dto.descricao).toBe("Gasto");
  });

  it("acentos e maiúsculas não atrapalham a categoria", () => {
    const r = ok(lancamento({ categoriaNome: "SAUDE", formaPagamento: "PIX" }));
    expect(r.dto.categoriaId).toBe("cat-saude");
    expect(r.revisado).toBe(true);
  });

  it("dúvida do modelo vira pendência", () => {
    const r = ok(lancamento({ duvida: "Não sei se foi hoje." }));
    expect(r.revisado).toBe(false);
    expect(r.observacao).toBe('Mensagem: "mercado 230 no vr". Não sei se foi hoje.');
  });

  it("observação fica em até 300 caracteres", () => {
    const r = ok(lancamento({ duvida: "d".repeat(400) }), contexto({ mensagem: "m".repeat(400) }));
    expect(r.observacao.length).toBeLessThanOrEqual(300);
    expect(r.observacao.startsWith('Mensagem: "')).toBe(true);
  });

  it("sem lançamento → pergunta", () => {
    expect(pergunta({ intencao: "REGISTRAR", lancamento: null, consulta: null })).toMatch(/Não entendi/);
  });
});

describe("normalizarNome", () => {
  it("tira acento, caixa e espaços extras", () => expect(normalizarNome("  Educação   Física ")).toBe("educacao fisica"));
});
