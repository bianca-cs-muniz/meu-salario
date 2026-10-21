import DataSource from "@database/data-source";
import { cartaoResumidoSelect } from "@database/selects";

class ResumoRepository {
  lancamentos(usuarioId: string, competencias: string[]) {
    return DataSource.lancamento.findMany({
      where: { usuarioId, competencia: { in: competencias } },
      select: { tipo: true, valorCentavos: true, formaPagamento: true, carteiraId: true, categoriaId: true, competencia: true },
    });
  }

  categorias(usuarioId: string) {
    return DataSource.categoria.findMany({
      where: { usuarioId },
      select: { id: true, nome: true, icone: true, cor: true, grupo: true, limiteMensalCentavos: true },
    });
  }

  carteirasVr(usuarioId: string) {
    return DataSource.carteira.findMany({
      where: { usuarioId, tipo: "VR" },
      select: { id: true, ativa: true },
      orderBy: { criadoEm: "asc" },
    });
  }

  /** Entradas e saídas da carteira até a competência (inclusive). */
  movimentoAte(usuarioId: string, carteiraId: string, ate: string) {
    return DataSource.lancamento.groupBy({
      by: ["tipo"],
      where: { usuarioId, carteiraId, competencia: { lte: ate } },
      _sum: { valorCentavos: true },
    });
  }

  pendencias(usuarioId: string) {
    return DataSource.lancamento.count({ where: { usuarioId, revisado: false } });
  }

  entradasFixas(usuarioId: string) {
    return DataSource.recorrencia.count({ where: { usuarioId, ativa: true, tipo: "ENTRADA" } });
  }

  cartoesAtivos(usuarioId: string) {
    return DataSource.cartao.findMany({
      where: { usuarioId, ativo: true },
      select: { ...cartaoResumidoSelect, diaFechamento: true, diaVencimento: true },
      orderBy: { criadoEm: "asc" },
    });
  }
}

export default new ResumoRepository();
