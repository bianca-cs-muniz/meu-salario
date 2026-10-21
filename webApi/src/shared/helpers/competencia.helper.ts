export type CicloCartao = { competencia: string; fechamento: Date; vencimento: Date };
const fuso = "America/Sao_Paulo";
function partes(data: Date): { ano: number; mes: number; dia: number } {
  const valores = new Intl.DateTimeFormat("en-US", { timeZone: fuso, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(data);
  return { ano: Number(valores.find((p) => p.type === "year")!.value), mes: Number(valores.find((p) => p.type === "month")!.value), dia: Number(valores.find((p) => p.type === "day")!.value) };
}
function dataNoFuso(ano: number, mes: number, dia: number, hora = 12): Date {
  const alvoUtc = Date.UTC(ano, mes - 1, dia, hora);
  let instante = alvoUtc;
  const formato = new Intl.DateTimeFormat("en-US", { timeZone: fuso, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const partesData = formato.formatToParts(new Date(instante));
    const observadoUtc = Date.UTC(Number(partesData.find((p) => p.type === "year")!.value), Number(partesData.find((p) => p.type === "month")!.value) - 1, Number(partesData.find((p) => p.type === "day")!.value), Number(partesData.find((p) => p.type === "hour")!.value), Number(partesData.find((p) => p.type === "minute")!.value));
    const diferenca = alvoUtc - observadoUtc;
    instante += diferenca;
    if (diferenca === 0) break;
  }
  return new Date(instante);
}
export function competenciaDe(data: Date): string { const p = partes(data); return `${p.ano}-${String(p.mes).padStart(2, "0")}`; }
export function deslocarCompetencia(competencia: string, meses: number): string { const [ano, mes] = competencia.split("-").map(Number); const data = new Date(Date.UTC(ano, mes - 1 + meses, 1)); return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`; }
export function competenciaAtual(agora = new Date()): string { return competenciaDe(agora); }
export function competenciaAnterior(agora = new Date()): string { return deslocarCompetencia(competenciaDe(agora), -1); }
export function proximaCompetencia(agora = new Date()): string { return deslocarCompetencia(competenciaDe(agora), 1); }
export function cicloDoCartao(data: Date, diaFechamento: number, diaVencimento: number): CicloCartao {
  if (diaFechamento < 1 || diaFechamento > 28 || diaVencimento < 1 || diaVencimento > 28) throw new Error("Dias de fechamento e vencimento devem estar entre 1 e 28.");
  const compra = partes(data);
  const mesFechamento = compra.mes + (compra.dia >= diaFechamento ? 1 : 0);
  const dataFechamento = dataNoFuso(compra.ano + Math.floor((mesFechamento - 1) / 12), ((mesFechamento - 1) % 12) + 1, diaFechamento);
  const mesVencimento = mesFechamento + (diaVencimento <= diaFechamento ? 1 : 0);
  const vencimento = dataNoFuso(compra.ano + Math.floor((mesVencimento - 1) / 12), ((mesVencimento - 1) % 12) + 1, diaVencimento);
  return { competencia: competenciaDe(vencimento), fechamento: dataFechamento, vencimento };
}

// ---------------------------------------------------------------------------
// Funções usadas pela API (sempre no fuso de São Paulo; nunca getDate()/getMonth() locais).

/** Quantos dias tem o mês da competência "AAAA-MM". */
export function diasNoMes(competencia: string): number {
  const [ano, mes] = competencia.split("-").map(Number);
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}

/** Dia do mês de hoje em São Paulo. */
export function diaHoje(agora = new Date()): number {
  return partes(agora).dia;
}

/** 00:00 de amanhã em São Paulo: a partir daí uma data conta como "futura". */
export function inicioDeAmanha(agora = new Date()): Date {
  const hoje = partes(agora);
  const amanha = new Date(Date.UTC(hoje.ano, hoje.mes - 1, hoje.dia + 1));
  return dataNoFuso(amanha.getUTCFullYear(), amanha.getUTCMonth() + 1, amanha.getUTCDate(), 0);
}

/** Meio-dia de São Paulo no dia informado da competência (limitado ao último dia do mês). */
export function dataNaCompetencia(competencia: string, dia: number): Date {
  const [ano, mes] = competencia.split("-").map(Number);
  return dataNoFuso(ano, mes, Math.min(dia, diasNoMes(competencia)));
}

/** Inverso de cicloDoCartao: dada a competência (mês do vencimento), devolve fechamento e vencimento. */
export function cicloDaCompetencia(competencia: string, diaFechamento: number, diaVencimento: number): CicloCartao {
  const competenciaFechamento = diaVencimento > diaFechamento ? competencia : deslocarCompetencia(competencia, -1);
  return { competencia, fechamento: dataNaCompetencia(competenciaFechamento, diaFechamento), vencimento: dataNaCompetencia(competencia, diaVencimento) };
}

/** "AAAA-MM-DD" vira meio-dia de São Paulo daquele dia; qualquer outro formato ISO é usado como veio. */
export function interpretarData(texto: string): Date {
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (soData) return dataNoFuso(Number(soData[1]), Number(soData[2]), Number(soData[3]));
  return new Date(texto);
}

export const REGEX_COMPETENCIA = /^\d{4}-(0[1-9]|1[0-2])$/;
