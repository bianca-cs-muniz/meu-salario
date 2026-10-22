// Textos do estagiário (puros, pt-BR, texto simples: o Telegram recebe sem parse_mode).
import { formatarDinheiro } from "../../../shared/helpers/dinheiro.helper";

type Forma = "PIX" | "DEBITO" | "DINHEIRO" | "CREDITO" | "VR";
const NOME_FORMA: Record<Forma, string> = { PIX: "Pix", DEBITO: "Débito", DINHEIRO: "Dinheiro", CREDITO: "Crédito", VR: "VR" };

const EXEMPLOS = [
  "debito farmacia 2,90",
  "pix uber 18,50",
  "credito ifood 45 no nubank",
  "vr mercado 230",
  "parcelamento tenis 600 em 3x no nubank",
  "entrada salario 4500",
  "entrada vr 800",
  "sobra",
  "gasto mercado",
  "fatura nubank",
  "apaga",
].map((e) => `• ${e}`);

const formatoDiaMes = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });
/** "AAAA-MM" → "10/2026". */
const mesAno = (competencia: string) => `${competencia.slice(5, 7)}/${competencia.slice(0, 4)}`;
/** Data ISO → "10/11" em São Paulo. */
export const diaMes = (iso: string | Date) => formatoDiaMes.format(new Date(iso));

const STATUS_FATURA: Record<string, string> = { ABERTA: "aberta", FECHADA: "fechada", PAGA: "paga", ATRASADA: "atrasada" };

export type ResumoLancado = {
  tipo: "ENTRADA" | "SAIDA";
  descricao: string;
  valorCentavos: number;
  formaPagamento: Forma;
  categoriaNome: string | null;
  cartaoNome: string | null;
  parcelas: number;
  revisado: boolean;
  motivos: string[];
  impacto: {
    sobraCentavos: number;
    faturaTotalCentavos: number | null;
    faturaCompetencia: string | null;
    saldoVrCentavos: number | null;
    saldoInsuficiente: boolean;
  };
};

const Respostas = {
  RECUSA: "Não consigo ajudar com isso.",
  NAO_ENTENDI: "Não entendi, pode escrever de outro jeito?",
  OCUPADO: "Estou ocupado, tenta em um minuto.",
  SEM_CONEXAO: "Não consegui pensar agora, manda de novo.",
  FALHA: "Não consegui fazer isso agora. Tenta de novo daqui a pouco.",
  /** Resposta quando a mensagem não segue o formato (e o Claude não entra). */
  FORMATO: "Não entendi. Use: debito farmacia 2,90 · credito ifood 45 · vr mercado 230 · parcelamento 300 em 2x no nubank",
  SO_TEXTO: "Por enquanto só entendo texto. Me manda por escrito, tipo: debito mercado 45.",
  MENSAGEM_LONGA: "Mensagem longa demais. Manda um gasto por vez, em poucas palavras.",
  NAO_VINCULADO: "Oi! Ainda não sei de quem é este chat. Abra Configurações no app Meu Salário e toque em Conectar Telegram.",
  LINK_EXPIRADO: "Esse link expirou. Abra Configurações no app e toque em Conectar Telegram.",
  /** Acrescentado ao "Conectado" quando o /start tirou o chat de outra conta. */
  CHAT_MOVIDO: "Este chat estava ligado a outra conta e agora foi movido para a sua.",
  DESCONECTADO: "Desconectado. Não vou mais anotar nada por aqui. Para voltar, abra Configurações no app e toque em Conectar Telegram.",
  NADA_PARA_APAGAR: "Não achei nenhum lançamento seu feito por aqui nas últimas 24 horas.",
  QUANTO_FOI: "Quanto foi?",

  ajuda(): string {
    return [
      "Escreva assim: forma, o que foi, valor.",
      "Formas: debito, credito (ou cartao), pix, dinheiro e vr (ou va).",
      "Para outro dia, termine com ontem ou 20/10.",
      "",
      "Exemplos:",
      ...EXEMPLOS,
      "",
      "Comandos: /sobra, /fatura, /gasto, /apagar, /ajuda e /desconectar.",
    ].join("\n");
  },

  conectado(nome: string): string {
    return [`Conectado, ${nome}! Agora é só me mandar os gastos. Exemplos:`, ...EXEMPLOS.slice(0, 5)].join("\n");
  },

  limite(motivo: "JANELA" | "DIA" | "GLOBAL"): string {
    if (motivo === "JANELA") return "Calma, muitas mensagens em pouco tempo. Tenta de novo em alguns minutos.";
    if (motivo === "DIA") return "Chegamos no limite de mensagens de hoje. Amanhã eu volto!";
    return "Estou ocupado, tenta mais tarde.";
  },

  desconhecido(): string {
    return Respostas.FORMATO;
  },

  lancado(l: ResumoLancado): string {
    const forma =
      l.formaPagamento === "CREDITO"
        ? `Crédito${l.cartaoNome ? ` ${l.cartaoNome}` : ""}${l.parcelas > 1 ? ` em ${l.parcelas}x` : ""}`
        : NOME_FORMA[l.formaPagamento];
    const categoria = l.categoriaNome ? ` (${l.categoriaNome})` : "";
    const linhas = [`${l.tipo === "ENTRADA" ? "Entrada anotada" : "Anotado"}: ${l.descricao} ${formatarDinheiro(l.valorCentavos)} · ${forma}${categoria}.`];
    const i = l.impacto;
    if (l.formaPagamento === "VR" && i.saldoVrCentavos !== null) {
      linhas.push(`Saldo do VR: ${formatarDinheiro(i.saldoVrCentavos)}${i.saldoInsuficiente ? " (ficou negativo!)" : ""}`);
    } else if (l.formaPagamento === "CREDITO" && i.faturaTotalCentavos !== null && i.faturaCompetencia) {
      linhas.push(`Fatura de ${mesAno(i.faturaCompetencia)}: ${formatarDinheiro(i.faturaTotalCentavos)}`);
    } else {
      linhas.push(`Sobra do mês: ${formatarDinheiro(i.sobraCentavos)}`);
    }
    if (!l.revisado) linhas.push(`Deixei em Pendências: ${l.motivos.length ? l.motivos.join(" ") : "confere no app."}`);
    return linhas.join("\n");
  },

  sobra(r: { competencia: string; sobraCentavos: number; diasRestantes: number; podeGastarPorDiaCentavos: number; pendencias: number }): string {
    const linhas = [`Sobra de ${mesAno(r.competencia)}: ${formatarDinheiro(r.sobraCentavos)}.`];
    if (r.diasRestantes > 0) {
      linhas.push(
        r.sobraCentavos > 0
          ? `Faltam ${r.diasRestantes} dia(s): dá para gastar ${formatarDinheiro(r.podeGastarPorDiaCentavos)} por dia.`
          : `Faltam ${r.diasRestantes} dia(s) e não sobra nada: segura os gastos.`,
      );
    }
    if (r.pendencias > 0) linhas.push(`Você tem ${r.pendencias} lançamento(s) em Pendências para conferir no app.`);
    return linhas.join("\n");
  },

  categoria(c: { nome: string; gastoCentavos: number; limiteMensalCentavos: number | null; competencia: string }): string {
    const base = `${c.nome} em ${mesAno(c.competencia)}: ${formatarDinheiro(c.gastoCentavos)}`;
    if (c.limiteMensalCentavos === null) return `${base}.`;
    const resta = c.limiteMensalCentavos - c.gastoCentavos;
    return `${base} de ${formatarDinheiro(c.limiteMensalCentavos)} (${resta >= 0 ? `restam ${formatarDinheiro(resta)}` : `passou ${formatarDinheiro(-resta)}`}).`;
  },

  categoriasDoMes(competencia: string, lista: { nome: string; gastoCentavos: number }[]): string {
    if (!lista.length) return `Nenhum gasto com categoria em ${mesAno(competencia)}.`;
    return [`Gastos de ${mesAno(competencia)}:`, ...lista.map((c) => `• ${c.nome}: ${formatarDinheiro(c.gastoCentavos)}`)].join("\n");
  },

  categoriaNaoEncontrada(nome: string, nomes: string[]): string {
    return `Não achei a categoria "${nome}". Suas categorias: ${nomes.join(", ")}.`;
  },

  fatura(c: {
    nome: string;
    limiteCentavos: number | null;
    limiteUsadoCentavos: number;
    faturaAtual: { totalCentavos: number; vencimento: string; status: string; competencia: string };
  }): string {
    const f = c.faturaAtual;
    const linhas = [`Fatura ${c.nome} (vence ${diaMes(f.vencimento)}): ${formatarDinheiro(f.totalCentavos)}, ${STATUS_FATURA[f.status] ?? f.status.toLowerCase()}.`];
    if (c.limiteCentavos !== null) linhas.push(`Limite usado: ${formatarDinheiro(c.limiteUsadoCentavos)} de ${formatarDinheiro(c.limiteCentavos)}.`);
    return linhas.join("\n");
  },

  semCartao(): string {
    return "Você não tem cartão de crédito ativo no app.";
  },

  cartaoNaoEncontrado(nome: string, nomes: string[]): string {
    return `Não achei o cartão "${nome}". Seus cartões: ${nomes.join(", ")}.`;
  },

  apagado(a: { descricao: string; valorCentavos: number; data: Date | string; parcelas: number | null }): string {
    if (a.parcelas && a.parcelas > 1) return `Apaguei a compra parcelada "${a.descricao}" (${a.parcelas} parcelas, total ${formatarDinheiro(a.valorCentavos)}).`;
    return `Apaguei: ${a.descricao} ${formatarDinheiro(a.valorCentavos)} (${diaMes(a.data)}).`;
  },
};

export default Respostas;
