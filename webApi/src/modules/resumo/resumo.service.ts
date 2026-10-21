import Repository from "./resumo.repository";
import FaturasService from "@modulos/faturas/faturas.service";
import { calcularResumo, movimentoVrDoMes, totaisDoMes } from "./resumo.calculo";
import { competenciaAtual, deslocarCompetencia, diaHoje } from "@helpers/competencia.helper";

class ResumoService {
  /** GET /resumo — padrão: mês atual. */
  async read(usuarioId: string, competencia = competenciaAtual()) {
    const [lancamentos, categorias, carteirasVr, cartoes, pendencias, entradasFixas] = await Promise.all([
      Repository.lancamentos(usuarioId, [competencia]),
      Repository.categorias(usuarioId),
      Repository.carteirasVr(usuarioId),
      Repository.cartoesAtivos(usuarioId),
      Repository.pendencias(usuarioId),
      Repository.entradasFixas(usuarioId),
    ]);
    const base = calcularResumo({
      competencia,
      competenciaAtual: competenciaAtual(),
      diaDeHoje: diaHoje(),
      lancamentos,
      categorias,
      carteirasVrIds: carteirasVr.map((c) => c.id),
    });
    const vrAtiva = carteirasVr.find((c) => c.ativa);
    const vr = vrAtiva
      ? { carteiraId: vrAtiva.id, saldoCentavos: await this.saldoCarteira(usuarioId, vrAtiva.id, competencia), ...movimentoVrDoMes(lancamentos, vrAtiva.id) }
      : null;
    return {
      ...base,
      vr,
      faturas: await FaturasService.resumosComItens(usuarioId, cartoes, competencia),
      pendencias,
      temEntradaFixa: entradasFixas > 0,
    };
  }

  /** GET /resumo/evolucao — `meses` meses terminando no mês atual. */
  async evolucao(usuarioId: string, meses: number) {
    const atual = competenciaAtual();
    const competencias = Array.from({ length: meses }, (_, i) => deslocarCompetencia(atual, i - meses + 1));
    const [lancamentos, carteirasVr] = await Promise.all([Repository.lancamentos(usuarioId, competencias), Repository.carteirasVr(usuarioId)]);
    const carteirasVrIds = carteirasVr.map((c) => c.id);
    return competencias.map((competencia) => {
      const { entradasCentavos, saidasCentavos, sobraCentavos } = totaisDoMes(
        lancamentos.filter((l) => l.competencia === competencia),
        carteirasVrIds,
      );
      return { competencia, entradasCentavos, saidasCentavos, sobraCentavos };
    });
  }

  /** Sobra (entradas − saídas, sem VR) de uma competência. */
  async sobra(usuarioId: string, competencia: string) {
    const [lancamentos, carteirasVr] = await Promise.all([Repository.lancamentos(usuarioId, [competencia]), Repository.carteirasVr(usuarioId)]);
    return totaisDoMes(lancamentos, carteirasVr.map((c) => c.id)).sobraCentavos;
  }

  /** Saldo acumulado de uma carteira (entradas − saídas) até a competência. */
  async saldoCarteira(usuarioId: string, carteiraId: string, ate: string) {
    const linhas = await Repository.movimentoAte(usuarioId, carteiraId, ate);
    return linhas.reduce((saldo, l) => saldo + (l.tipo === "ENTRADA" ? 1 : -1) * (l._sum.valorCentavos ?? 0), 0);
  }
}

export default new ResumoService();
