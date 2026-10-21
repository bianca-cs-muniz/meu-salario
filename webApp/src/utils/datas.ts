// Competência = "AAAA-MM". Datas da API chegam em ISO.

const FUSO = "America/Sao_Paulo";

export function competenciaDe(data: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit" }).format(data);
  return partes.slice(0, 7);
}

export function competenciaAtual(): string {
  return competenciaDe(new Date());
}

export function somarMeses(competencia: string, meses: number): string {
  const [ano, mes] = competencia.split("-").map(Number);
  const d = new Date(Date.UTC(ano, mes - 1 + meses, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dataDaCompetencia(competencia: string): Date {
  const [ano, mes] = competencia.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, 15));
}

export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "Outubro de 2026" */
export function nomeMes(competencia: string): string {
  return capitalizar(dataDaCompetencia(competencia).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }));
}

/** "outubro" */
export function nomeMesSemAno(competencia: string): string {
  return dataDaCompetencia(competencia).toLocaleDateString("pt-BR", { month: "long", timeZone: "UTC" });
}

/** "out" */
export function nomeMesCurto(competencia: string): string {
  return dataDaCompetencia(competencia)
    .toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" })
    .replace(".", "");
}

/** "26/09" */
export function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: FUSO });
}

/** "Hoje", "Ontem" ou "sáb, 26 set" */
export function rotuloDia(iso: string): string {
  const chave = chaveDia(iso);
  const hoje = chaveDia(new Date().toISOString());
  const ontem = chaveDia(new Date(Date.now() - 86_400_000).toISOString());
  if (chave === hoje) return "Hoje";
  if (chave === ontem) return "Ontem";
  return capitalizar(
    new Date(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short", timeZone: FUSO }).replace(/\./g, ""),
  );
}

/** "2026-09-26" no fuso de São Paulo, para agrupar por dia. */
export function chaveDia(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(new Date(iso));
}

/** Valor para <input type="date"> a partir de ISO (ou hoje). */
export function paraInputData(iso?: string): string {
  return chaveDia(iso ?? new Date().toISOString());
}

/** "2026-09-26" do input → ISO ao meio-dia, para não trocar de dia por fuso. */
export function deInputData(valor: string): string {
  return new Date(`${valor}T12:00:00-03:00`).toISOString();
}
