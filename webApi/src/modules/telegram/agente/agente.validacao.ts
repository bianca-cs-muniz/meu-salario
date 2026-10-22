// Validação do que o modelo extraiu (pura: sem banco, sem rede, sem alias).
// O modelo só sugere; aqui se decide o que vira lançamento, o que fica em Pendências e o que vira pergunta.
import type { Extracao } from "./agente.extracao";

type Forma = "PIX" | "DEBITO" | "DINHEIRO" | "CREDITO" | "VR";

export type ContextoValidacao = {
  /** Texto original da mensagem (vai na observação). */
  mensagem: string;
  /** "AAAA-MM-DD" de hoje em America/Sao_Paulo. */
  hoje: string;
  /** Categorias ativas. */
  categorias: { id: string; nome: string; aceitaVr: boolean }[];
  /** Cartões ativos, do mais antigo para o mais novo (o 1º é o padrão). */
  cartoes: { id: string; nome: string }[];
  temCarteiraVr: boolean;
};

export type LancamentoValidado = {
  dto: {
    tipo: "ENTRADA" | "SAIDA";
    descricao: string;
    valorCentavos: number;
    data: string;
    formaPagamento: Forma;
    categoriaId?: string;
    cartaoId?: string;
    parcelas: number;
  };
  revisado: boolean;
  observacao: string;
  motivos: string[];
  categoriaNome: string | null;
  cartaoNome: string | null;
};

export type ResultadoValidacao = { ok: LancamentoValidado } | { perguntar: string };

export const LIMITE_REVISAO_CENTAVOS = 5_000_000; // R$ 50.000
const VALOR_MAXIMO_CENTAVOS = 2_147_483_647;
const MAX_DESCRICAO = 120;
const MAX_OBSERVACAO = 300;
const DIAS_ANTIGO = 60;
const UM_DIA_MS = 86_400_000;

/** Minúsculas, sem acento e com espaços simples: "Saúde " → "saude". */
export function normalizarNome(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

function acharPorNome<T extends { nome: string }>(lista: T[], nome: string | null | undefined): T | undefined {
  if (!nome?.trim()) return undefined;
  const alvo = normalizarNome(nome);
  return lista.find((item) => normalizarNome(item.nome) === alvo);
}

/** Dia (UTC) de uma data "AAAA-MM-DD" existente no calendário; null se inválida. */
function diaUtc(texto: string): number | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!partes) return null;
  const [ano, mes, dia] = [Number(partes[1]), Number(partes[2]), Number(partes[3])];
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia ? d.getTime() : null;
}

function montarObservacao(mensagem: string, motivos: string[]): string {
  const texto = mensagem.replace(/\s+/g, " ").trim();
  const citacao = `Mensagem: "${texto.length > 150 ? `${texto.slice(0, 149)}…` : texto}".`;
  const completa = motivos.length ? `${citacao} ${motivos.join(" ")}` : citacao;
  return completa.length > MAX_OBSERVACAO ? `${completa.slice(0, MAX_OBSERVACAO - 1)}…` : completa;
}

export function validarLancamento(extracao: Extracao, contexto: ContextoValidacao): ResultadoValidacao {
  const l = extracao.lancamento;
  if (!l) return { perguntar: "Não entendi o lançamento. Manda algo como: debito mercado 45." };

  const motivos: string[] = [];

  // Valor
  const valor = l.valorCentavos;
  if (valor === null || !Number.isInteger(valor) || valor <= 0) return { perguntar: "Quanto foi?" };
  if (valor > VALOR_MAXIMO_CENTAVOS) return { perguntar: "Esse valor é alto demais. Quanto foi mesmo?" };
  if (valor > LIMITE_REVISAO_CENTAVOS) motivos.push("Valor acima de R$ 50.000: confere se está certo.");

  // Descrição
  let descricao = l.descricao.replace(/\s+/g, " ").trim();
  if (!descricao) descricao = l.tipo === "ENTRADA" ? "Entrada" : "Gasto";
  if (descricao.length > MAX_DESCRICAO) descricao = descricao.slice(0, MAX_DESCRICAO).trim();

  // Categoria: SAIDA exige (cai em "Outros" quando não achar); ENTRADA pode ficar sem.
  let categoria = acharPorNome(contexto.categorias, l.categoriaNome);
  if (!categoria && l.tipo === "SAIDA") {
    const outros = acharPorNome(contexto.categorias, "Outros");
    if (!outros) return { perguntar: `Em qual categoria? ${contexto.categorias.map((c) => c.nome).join(", ")}.` };
    categoria = outros;
    motivos.push(l.categoriaNome?.trim() ? `Coloquei em Outros; talvez seja ${l.categoriaNome.trim()}.` : "Coloquei em Outros.");
  }

  // Forma de pagamento
  let forma: Forma;
  if (l.formaPagamento) {
    forma = l.formaPagamento;
  } else if (l.tipo === "ENTRADA") {
    forma = "PIX"; // entrada sem forma: cai na conta (não há débito/crédito em entrada)
  } else {
    forma = "DEBITO";
    motivos.push("Não sei se foi débito ou crédito.");
  }
  if (l.tipo === "ENTRADA" && forma === "CREDITO") {
    forma = "PIX";
    motivos.push("Entrada não pode ser no crédito; anotei como Pix.");
  }

  // VR: só em categoria que aceita VR e com carteira VR.
  if (forma === "VR") {
    if (!contexto.temCarteiraVr) return { perguntar: "Cadastre a carteira VR no app antes de usar VR." };
    if (l.tipo === "SAIDA" && !categoria?.aceitaVr) {
      const aceitam = contexto.categorias.filter((c) => c.aceitaVr).map((c) => c.nome);
      return {
        perguntar: `VR só vale para ${aceitam.length ? aceitam.join(" e ") : "categorias que aceitam VR"}. ${categoria ? `"${categoria.nome}" não aceita VR.` : ""} Foi em outra forma de pagamento?`.replace(/\s+/g, " ").trim(),
      };
    }
  }

  // Cartão (só no crédito)
  let cartao: { id: string; nome: string } | undefined;
  if (forma === "CREDITO") {
    if (!contexto.cartoes.length) return { perguntar: "Você não tem cartão de crédito cadastrado. Cadastre no app ou me diga outra forma de pagamento." };
    const citado = l.cartaoNome?.trim();
    cartao = acharPorNome(contexto.cartoes, citado);
    if (!cartao) {
      cartao = contexto.cartoes[0];
      if (citado) motivos.push(`Não achei o cartão "${citado}"; usei o ${cartao.nome}.`);
      else if (contexto.cartoes.length > 1) motivos.push(`Não sei em qual cartão; usei o ${cartao.nome}.`);
    }
  }

  // Parcelas: só no crédito, de 1 a 48.
  let parcelas = 1;
  if (l.parcelas !== null && l.parcelas > 1) {
    if (forma !== "CREDITO") motivos.push("Parcelas só valem no crédito; anotei à vista.");
    else if (l.parcelas > 48) return { perguntar: "Dá para parcelar em até 48 vezes. Em quantas foi?" };
    else parcelas = l.parcelas;
  }

  // Data
  let data = contexto.hoje;
  const hojeMs = diaUtc(contexto.hoje)!;
  if (l.data) {
    const dataMs = diaUtc(l.data);
    if (dataMs === null) motivos.push("Não entendi a data; usei hoje.");
    else if (dataMs > hojeMs) motivos.push("A data ficou no futuro; usei hoje.");
    else {
      data = l.data;
      if (hojeMs - dataMs > DIAS_ANTIGO * UM_DIA_MS) motivos.push("Data de mais de 60 dias atrás: confere.");
    }
  }

  if (l.duvida?.trim()) motivos.push(l.duvida.trim());

  return {
    ok: {
      dto: {
        tipo: l.tipo,
        descricao,
        valorCentavos: valor,
        data,
        formaPagamento: forma,
        ...(categoria ? { categoriaId: categoria.id } : {}),
        ...(cartao ? { cartaoId: cartao.id } : {}),
        parcelas,
      },
      revisado: motivos.length === 0,
      observacao: montarObservacao(contexto.mensagem, motivos),
      motivos,
      categoriaNome: categoria?.nome ?? null,
      cartaoNome: cartao?.nome ?? null,
    },
  };
}
