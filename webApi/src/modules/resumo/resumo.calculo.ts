// Cálculos puros do resumo do mês (sem banco, sem alias: testáveis isoladamente).
import { diasNoMes } from "../../shared/helpers/competencia.helper";

export type GrupoCategoria = "ESSENCIAL" | "DESEJO" | "POUPANCA";

export type LancamentoCalculo = {
  tipo: "ENTRADA" | "SAIDA";
  valorCentavos: number;
  formaPagamento: string;
  carteiraId: string | null;
  categoriaId: string | null;
};

export type CategoriaCalculo = {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  grupo: GrupoCategoria;
  limiteMensalCentavos: number | null;
};

export type ResumoCategoria = {
  categoriaId: string;
  nome: string;
  icone: string;
  cor: string;
  grupo: GrupoCategoria;
  limiteMensalCentavos: number | null;
  totalCentavos: number;
};

export type ResumoCalculado = {
  competencia: string;
  entradasCentavos: number;
  saidasCentavos: number;
  sobraCentavos: number;
  comprometidoPct: number;
  diasRestantes: number;
  podeGastarPorDiaCentavos: number;
  porCategoria: ResumoCategoria[];
  porGrupo: Record<GrupoCategoria, number>;
};

/** Entradas sem as que caem na carteira VR; saídas sem as pagas com VR. */
export function totaisDoMes(lancamentos: LancamentoCalculo[], carteirasVrIds: string[]) {
  const entradas = lancamentos.filter((l) => l.tipo === "ENTRADA" && !(l.carteiraId && carteirasVrIds.includes(l.carteiraId)));
  const saidas = lancamentos.filter((l) => l.tipo === "SAIDA" && l.formaPagamento !== "VR");
  const entradasCentavos = entradas.reduce((soma, l) => soma + l.valorCentavos, 0);
  const saidasCentavos = saidas.reduce((soma, l) => soma + l.valorCentavos, 0);
  return { entradasCentavos, saidasCentavos, sobraCentavos: entradasCentavos - saidasCentavos, saidas };
}

/** Mês atual: dias que faltam contando hoje; futuro: o mês inteiro; passado: 0. */
export function diasRestantesNaCompetencia(competencia: string, competenciaAtual: string, diaDeHoje: number): number {
  if (competencia === competenciaAtual) return diasNoMes(competencia) - diaDeHoje + 1;
  if (competencia > competenciaAtual) return diasNoMes(competencia);
  return 0;
}

export function calcularResumo(entrada: {
  competencia: string;
  competenciaAtual: string;
  diaDeHoje: number;
  lancamentos: LancamentoCalculo[];
  categorias: CategoriaCalculo[];
  carteirasVrIds: string[];
}): ResumoCalculado {
  const { competencia, competenciaAtual, diaDeHoje, lancamentos, categorias, carteirasVrIds } = entrada;
  const { entradasCentavos, saidasCentavos, sobraCentavos, saidas } = totaisDoMes(lancamentos, carteirasVrIds);

  const totalPorCategoria = new Map<string, number>();
  for (const l of saidas) {
    if (!l.categoriaId) continue;
    totalPorCategoria.set(l.categoriaId, (totalPorCategoria.get(l.categoriaId) ?? 0) + l.valorCentavos);
  }
  const porCategoria: ResumoCategoria[] = [];
  for (const [categoriaId, totalCentavos] of totalPorCategoria) {
    const categoria = categorias.find((c) => c.id === categoriaId);
    if (!categoria) continue;
    porCategoria.push({
      categoriaId,
      nome: categoria.nome,
      icone: categoria.icone,
      cor: categoria.cor,
      grupo: categoria.grupo,
      limiteMensalCentavos: categoria.limiteMensalCentavos,
      totalCentavos,
    });
  }
  porCategoria.sort((a, b) => b.totalCentavos - a.totalCentavos);

  const porGrupo: Record<GrupoCategoria, number> = { ESSENCIAL: 0, DESEJO: 0, POUPANCA: 0 };
  for (const c of porCategoria) porGrupo[c.grupo] += c.totalCentavos;

  const diasRestantes = diasRestantesNaCompetencia(competencia, competenciaAtual, diaDeHoje);
  return {
    competencia,
    entradasCentavos,
    saidasCentavos,
    sobraCentavos,
    comprometidoPct: entradasCentavos ? (saidasCentavos / entradasCentavos) * 100 : 0,
    diasRestantes,
    podeGastarPorDiaCentavos: diasRestantes && sobraCentavos > 0 ? Math.floor(sobraCentavos / diasRestantes) : 0,
    porCategoria,
    porGrupo,
  };
}

/** Entradas e saídas do mês dentro da carteira VR. */
export function movimentoVrDoMes(lancamentos: LancamentoCalculo[], carteiraVrId: string) {
  const doVr = lancamentos.filter((l) => l.carteiraId === carteiraVrId);
  return {
    entradasMesCentavos: doVr.filter((l) => l.tipo === "ENTRADA").reduce((soma, l) => soma + l.valorCentavos, 0),
    saidasMesCentavos: doVr.filter((l) => l.tipo === "SAIDA").reduce((soma, l) => soma + l.valorCentavos, 0),
  };
}
