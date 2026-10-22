// Leitor por regras do estagiário (puro: sem banco, sem rede, sem relógio).
// Formato fixo: "<forma> <o que foi> <valor> [no <banco>] [ontem|hoje|dd/mm]", parcelamento, entrada e consultas curtas.
// Devolve o MESMO tipo do Claude (Extracao), que segue para a validação de sempre:
// - Extracao completa quando a mensagem segue a gramática;
// - Extracao DESCONHECIDO quando começa com palavra da gramática mas está incompleta (responde o formato, sem Claude);
// - null quando não parece a gramática (vai ao Claude, se houver chave).
import type { Extracao } from "./agente.extracao";
import { normalizarNome } from "./agente.validacao";
import { CATEGORIA_POR_SINONIMO } from "./sinonimos";

export type ContextoRegras = {
  /** "AAAA-MM-DD" de hoje em America/Sao_Paulo. */
  hoje: string;
  /** Categorias ativas. */
  categorias: { nome: string }[];
  /** Cartões ativos. */
  cartoes: { nome: string }[];
};

type Forma = "PIX" | "DEBITO" | "CREDITO" | "VR" | "DINHEIRO";
type Intencao = Extracao["intencao"];

const FORMAS: Record<string, Forma> = {
  debito: "DEBITO",
  credito: "CREDITO",
  cartao: "CREDITO",
  vr: "VR",
  va: "VR",
  pix: "PIX",
  dinheiro: "DINHEIRO",
};
const FORMAS_DE_ENTRADA = new Set<Forma>(["PIX", "DINHEIRO", "VR"]);
const PALAVRAS_PARCELAMENTO = new Set(["parcelamento", "parcelado", "parcelei"]);
const PALAVRAS_ENTRADA = new Set(["entrada", "recebi"]);
const PREPOSICOES_BANCO = new Set(["no", "na"]);
const PREPOSICOES_CONSULTA = new Set(["com", "de", "da", "do", "no", "na", "em"]);

const FRASES_SOBRA = new Set(["sobra", "sobrou", "quanto sobrou", "quanto sobra"]);
const FRASES_APAGAR = new Set(["apaga", "apagar", "apaga o ultimo", "apagar o ultimo", "apaga ultimo", "apagar ultimo", "desfaz", "desfazer"]);
const FRASES_AJUDA = new Set(["ajuda", "help", "comandos", "menu"]);

const MAX_DIGITOS_INTEIROS = 10;
const MAX_PARCELAS_REGRAS = 99;
const REGEX_VALOR_VIRGULA = /^\d+(,\d{1,2})?$/; // 2,90 · 1400 · 2,9
const REGEX_VALOR_PONTO = /^\d+\.\d{1,2}$/; // 2.90
const REGEX_VALOR_MILHAR = /^\d{1,3}(\.\d{3})+(,\d{1,2})?$/; // 1.400 · 1.400,00

export const DATA_INVALIDA = "INVALIDA" as const;

// ---------------------------------------------------------------- peças exportadas (testadas à parte)

/** "2,90" → 290; "R$1.400,00" → 140000; "1,400" (ambíguo) ou não numérico → null. Só inteiros, sem float. */
export function lerValorCentavos(token: string): number | null {
  const texto = token.trim().replace(/^r\$/i, "");
  let inteiro: string;
  let centavos: string;
  if (REGEX_VALOR_VIRGULA.test(texto)) [inteiro, centavos = ""] = texto.split(",");
  else if (REGEX_VALOR_PONTO.test(texto)) [inteiro, centavos] = texto.split(".");
  else if (REGEX_VALOR_MILHAR.test(texto)) {
    const [parteInteira, parteCentavos = ""] = texto.split(",");
    inteiro = parteInteira.replace(/\./g, "");
    centavos = parteCentavos;
  } else return null;
  inteiro = inteiro.replace(/^0+(?=\d)/, "");
  if (inteiro.length > MAX_DIGITOS_INTEIROS) return null;
  return Number(inteiro) * 100 + Number(centavos.padEnd(2, "0"));
}

/**
 * Categoria da descrição: (1) descrição = nome (aceita plural simples "s"); (2) nome dentro da descrição;
 * (3) sinônimo por palavra, da esquerda para a direita; (4) null. Devolve o nome como está na lista.
 */
export function resolverCategoria(descricao: string, categorias: { nome: string }[]): string | null {
  const alvo = normalizarNome(descricao);
  if (!alvo) return null;
  const porNome = new Map(categorias.map((c) => [normalizarNome(c.nome), c.nome]));

  const direto = porNome.get(alvo) ?? porNome.get(`${alvo}s`) ?? (alvo.endsWith("s") ? porNome.get(alvo.slice(0, -1)) : undefined);
  if (direto) return direto;

  const dentro = [...porNome.keys()].sort((a, b) => b.length - a.length).find((nome) => ` ${alvo} `.includes(` ${nome} `));
  if (dentro) return porNome.get(dentro)!;

  for (const palavra of alvo.split(" ")) {
    const padrao = CATEGORIA_POR_SINONIMO.get(palavra) ?? (palavra.endsWith("s") ? CATEGORIA_POR_SINONIMO.get(palavra.slice(0, -1)) : undefined);
    const nome = padrao ? porNome.get(padrao) : undefined;
    if (nome) return nome;
  }
  return null;
}

/** Cartão citado: nome igual (normalizado), senão prefixo único; senão o texto digitado. */
export function resolverCartao(texto: string, cartoes: { nome: string }[]): string | null {
  const digitado = texto.replace(/\s+/g, " ").trim();
  const alvo = normalizarNome(digitado);
  if (!alvo) return null;
  const igual = cartoes.find((c) => normalizarNome(c.nome) === alvo);
  if (igual) return igual.nome;
  const comPrefixo = cartoes.filter((c) => normalizarNome(c.nome).startsWith(alvo));
  return comPrefixo.length === 1 ? comPrefixo[0].nome : digitado;
}

/** "ontem" / "hoje" / "dd/mm" (relativo a hoje; futuro → ano anterior) → "AAAA-MM-DD"; data inexistente → DATA_INVALIDA; outro texto → null. */
export function lerData(token: string, hoje: string): string | typeof DATA_INVALIDA | null {
  const texto = normalizarNome(token);
  const [anoHoje, mesHoje, diaHoje] = hoje.split("-").map(Number);
  if (texto === "hoje") return hoje;
  if (texto === "ontem") return isoUtc(new Date(Date.UTC(anoHoje, mesHoje - 1, diaHoje - 1)));
  const partes = /^(\d{1,2})\/(\d{1,2})$/.exec(texto);
  if (!partes) return null;
  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = mes > mesHoje || (mes === mesHoje && dia > diaHoje) ? anoHoje - 1 : anoHoje;
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (mes < 1 || mes > 12 || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) return DATA_INVALIDA;
  return isoUtc(data);
}

// ---------------------------------------------------------------- leitor

/** Interpreta a mensagem pelo formato fixo. Ver o topo do arquivo para os três resultados. */
export function interpretar(texto: string, ctx: ContextoRegras): Extracao | null {
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (/^\?+$/.test(limpo)) return semCampos("AJUDA");

  let originais = limpo.replace(/[?!.]+$/, "").trim().split(" ").filter(Boolean);
  if (!originais.length) return null;
  const comando = /^\/([a-z0-9_]+)(?:@[a-z0-9_]+)?$/i.exec(originais[0]);
  if (comando) originais[0] = comando[1];
  originais = originais.filter((t) => t.toLowerCase() !== "r$");
  if (!originais.length) return null;
  const palavras: Palavras = { originais, tokens: originais.map(normalizarNome) };

  const frase = palavras.tokens.join(" ");
  if (FRASES_SOBRA.has(frase)) return consulta("CONSULTAR_SOBRA", null, null);
  if (FRASES_APAGAR.has(frase)) return semCampos("APAGAR_ULTIMO");
  if (FRASES_AJUDA.has(frase)) return semCampos("AJUDA");

  const [primeira, segunda] = palavras.tokens;
  if (primeira === "fatura") return lerFatura(fatiar(palavras, 1), ctx);
  if (primeira === "gasto" || primeira === "gastos") return lerGasto(fatiar(palavras, 1), ctx);

  if (PALAVRAS_ENTRADA.has(primeira)) return lerEntrada(fatiar(palavras, 1), ctx, null);
  if (FORMAS[primeira] && segunda !== undefined && PALAVRAS_ENTRADA.has(segunda)) return lerEntrada(fatiar(palavras, 2), ctx, FORMAS[primeira]);
  if (PALAVRAS_PARCELAMENTO.has(primeira)) return lerSaida(fatiar(palavras, 1), ctx, "CREDITO", true);
  if (FORMAS[primeira]) return lerSaida(fatiar(palavras, 1), ctx, FORMAS[primeira], false);
  return null;
}

/** Tokens como digitados (para a descrição) e normalizados (para comparar), sempre do mesmo tamanho. */
type Palavras = { originais: string[]; tokens: string[] };

function fatiar(p: Palavras, inicio: number, fim?: number): Palavras {
  return { originais: p.originais.slice(inicio, fim), tokens: p.tokens.slice(inicio, fim) };
}

function semCampos(intencao: Intencao): Extracao {
  return { intencao, lancamento: null, consulta: null };
}

function consulta(intencao: Intencao, categoriaNome: string | null, cartaoNome: string | null): Extracao {
  return { intencao, lancamento: null, consulta: { categoriaNome, cartaoNome, competencia: null } };
}

const desconhecido = () => semCampos("DESCONHECIDO");

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function isoUtc(data: Date): string {
  return data.toISOString().slice(0, 10);
}

/** Tira "do/da/com..." do começo do argumento de uma consulta. */
function semPreposicao(p: Palavras): Palavras {
  return p.tokens.length && PREPOSICOES_CONSULTA.has(p.tokens[0]) ? fatiar(p, 1) : p;
}

function lerFatura(resto: Palavras, ctx: ContextoRegras): Extracao {
  const argumento = semPreposicao(resto);
  if (!argumento.originais.length) return consulta("CONSULTAR_FATURA", null, null);
  return consulta("CONSULTAR_FATURA", null, resolverCartao(argumento.originais.join(" "), ctx.cartoes));
}

function lerGasto(resto: Palavras, ctx: ContextoRegras): Extracao | null {
  const argumento = semPreposicao(resto);
  if (!argumento.originais.length) return consulta("CONSULTAR_CATEGORIA", null, null);
  // "gasto mercado 50" parece um lançamento sem forma: o Claude decide.
  if (lerValorCentavos(argumento.tokens[argumento.tokens.length - 1]) !== null) return null;
  const digitado = argumento.originais.join(" ");
  return consulta("CONSULTAR_CATEGORIA", resolverCategoria(digitado, ctx.categorias) ?? capitalizar(digitado), null);
}

/** Último token "ontem" / "hoje" / "dd/mm" vira data. */
function separarData(p: Palavras, hoje: string): { resto: Palavras; data: string | null } | typeof DATA_INVALIDA {
  const ultimo = p.tokens[p.tokens.length - 1];
  const data = ultimo === undefined ? null : lerData(ultimo, hoje);
  if (data === DATA_INVALIDA) return DATA_INVALIDA;
  return data === null ? { resto: p, data: null } : { resto: fatiar(p, 0, -1), data };
}

/** Última ocorrência de "em Nx" / "em N x" / "em N vezes". */
function acharParcelas(tokens: string[]): { inicio: number; tamanho: number; parcelas: number } | null {
  for (let i = tokens.length - 2; i >= 0; i--) {
    if (tokens[i] !== "em") continue;
    const grudado = /^(\d{1,2})x$/.exec(tokens[i + 1]);
    if (grudado) return { inicio: i, tamanho: 2, parcelas: Number(grudado[1]) };
    if (/^\d{1,2}$/.test(tokens[i + 1]) && (tokens[i + 2] === "x" || tokens[i + 2] === "vezes")) return { inicio: i, tamanho: 3, parcelas: Number(tokens[i + 1]) };
  }
  return null;
}

function semFaixa(p: Palavras, inicio: number, tamanho: number): Palavras {
  return {
    originais: [...p.originais.slice(0, inicio), ...p.originais.slice(inicio + tamanho)],
    tokens: [...p.tokens.slice(0, inicio), ...p.tokens.slice(inicio + tamanho)],
  };
}

/** Saída: "<forma> <descrição> <valor> [em Nx] [no <banco>] [data]" e parcelamento (sempre crédito). */
function lerSaida(resto: Palavras, ctx: ContextoRegras, forma: Forma, parcelamento: boolean): Extracao {
  const comData = separarData(resto, ctx.hoje);
  if (comData === DATA_INVALIDA) return desconhecido();
  let p = comData.resto;

  let parcelas: number | null = null;
  const faixa = acharParcelas(p.tokens);
  if (faixa) {
    if (forma !== "CREDITO" || faixa.parcelas < 1 || faixa.parcelas > MAX_PARCELAS_REGRAS) return desconhecido();
    parcelas = faixa.parcelas;
    p = semFaixa(p, faixa.inicio, faixa.tamanho);
  }
  if (parcelamento && parcelas === null) return desconhecido();

  // "no <banco>" no fim (sem número depois do "no"/"na").
  let cartaoDigitado: string | null = null;
  const indiceNo = p.tokens.reduce((ultimo, t, i) => (PREPOSICOES_BANCO.has(t) ? i : ultimo), -1);
  if (indiceNo >= 0 && indiceNo < p.tokens.length - 1 && p.tokens.slice(indiceNo + 1).every((t) => lerValorCentavos(t) === null)) {
    if (forma !== "CREDITO") return desconhecido();
    cartaoDigitado = p.originais.slice(indiceNo + 1).join(" ");
    p = fatiar(p, 0, indiceNo);
  }

  // No crédito, o nome exato do cartão também vale sem o "no": "credito ifood 45 nubank".
  if (forma === "CREDITO" && cartaoDigitado === null && p.tokens.length && lerValorCentavos(p.tokens[p.tokens.length - 1]) === null) {
    const indiceValor = p.tokens.reduce((ultimo, t, i) => (lerValorCentavos(t) !== null ? i : ultimo), -1);
    const depois = indiceValor >= 0 ? normalizarNome(p.tokens.slice(indiceValor + 1).join(" ")) : "";
    const cartao = depois ? ctx.cartoes.find((c) => normalizarNome(c.nome) === depois) : undefined;
    if (cartao) {
      cartaoDigitado = cartao.nome;
      p = fatiar(p, 0, indiceValor + 1);
    }
  }

  if (!p.tokens.length) return desconhecido();
  const valor = lerValorCentavos(p.tokens[p.tokens.length - 1]);
  if (valor === null) return desconhecido();

  const digitado = p.originais.slice(0, -1).join(" ");
  if (!digitado && !parcelamento) return desconhecido();
  const descricao = digitado ? capitalizar(digitado) : "Parcelamento";

  return {
    intencao: "REGISTRAR",
    consulta: null,
    lancamento: {
      tipo: "SAIDA",
      valorCentavos: valor,
      descricao,
      categoriaNome: digitado ? resolverCategoria(digitado, ctx.categorias) : null,
      formaPagamento: forma,
      cartaoNome: cartaoDigitado === null ? null : resolverCartao(cartaoDigitado, ctx.cartoes),
      parcelas,
      data: comData.data,
      duvida: null,
    },
  };
}

/** Entrada: "entrada|recebi [pix|dinheiro|vr] <descrição> <valor> [data]" ou "pix|dinheiro|vr entrada ...". */
function lerEntrada(resto: Palavras, ctx: ContextoRegras, formaAntes: Forma | null): Extracao {
  let forma = formaAntes;
  let p = resto;
  if (!forma && p.tokens.length && FORMAS[p.tokens[0]]) {
    forma = FORMAS[p.tokens[0]];
    p = fatiar(p, 1);
  }
  if (forma && !FORMAS_DE_ENTRADA.has(forma)) return desconhecido();

  const comData = separarData(p, ctx.hoje);
  if (comData === DATA_INVALIDA) return desconhecido();
  p = comData.resto;
  if (!p.tokens.length) return desconhecido();
  const valor = lerValorCentavos(p.tokens[p.tokens.length - 1]);
  if (valor === null) return desconhecido();

  const digitado = p.originais.slice(0, -1).join(" ");
  if (!digitado && forma !== "VR") return desconhecido();

  return {
    intencao: "REGISTRAR",
    consulta: null,
    lancamento: {
      tipo: "ENTRADA",
      valorCentavos: valor,
      descricao: digitado ? capitalizar(digitado) : "Crédito do VR",
      categoriaNome: null,
      formaPagamento: forma,
      cartaoNome: null,
      parcelas: null,
      data: comData.data,
      duvida: null,
    },
  };
}
