import { Prisma } from "@prisma/client";
import DataSource from "@database/data-source";
import { Db, recorrenciaSelect } from "@database/selects";

class GastosFixosRepository {
  private repository = DataSource.recorrencia;

  transacao<T>(fn: (tx: Db) => Promise<T>) {
    return DataSource.$transaction(fn);
  }

  read(usuarioId: string, tipo?: "ENTRADA" | "SAIDA") {
    return this.repository.findMany({
      where: { usuarioId, tipo },
      select: recorrenciaSelect,
      orderBy: [{ ativa: "desc" }, { diaDoMes: "asc" }, { criadoEm: "asc" }],
    });
  }

  readById(usuarioId: string, id: string) {
    return this.repository.findFirst({ where: { id, usuarioId }, select: recorrenciaSelect });
  }

  create(data: Prisma.RecorrenciaUncheckedCreateInput) {
    return this.repository.create({ data, select: recorrenciaSelect });
  }

  update(id: string, data: Prisma.RecorrenciaUncheckedUpdateInput, db: Db = DataSource) {
    return db.recorrencia.update({ where: { id }, data, select: recorrenciaSelect });
  }

  /** Recorrências ativas que ainda não foram geradas até `limite`. */
  readPendentes(usuarioId: string, limite: string) {
    return this.repository.findMany({
      where: { usuarioId, ativa: true, OR: [{ geradaAte: null }, { geradaAte: { lt: limite } }] },
      select: {
        id: true,
        tipo: true,
        descricao: true,
        valorCentavos: true,
        diaDoMes: true,
        formaPagamento: true,
        categoriaId: true,
        carteiraId: true,
        cartaoId: true,
        inicio: true,
        fim: true,
        geradaAte: true,
        cartao: { select: { diaFechamento: true, diaVencimento: true } },
      },
    });
  }

  createLancamentos(data: Prisma.LancamentoCreateManyInput[], db: Db = DataSource) {
    return db.lancamento.createMany({ data, skipDuplicates: true });
  }

  /** Lançamentos com data a partir de `aPartirDe` e com o valor antigo recebem valor e descrição novos. */
  updateFuturos(recorrenciaId: string, aPartirDe: Date, valorAntigo: number, data: { valorCentavos: number; descricao: string }, db: Db = DataSource) {
    return db.lancamento.updateMany({ where: { recorrenciaId, data: { gte: aPartirDe }, valorCentavos: valorAntigo }, data });
  }

  /** Apaga os lançamentos com data a partir de `aPartirDe` (cobranças que ainda não aconteceram). */
  deleteFuturos(recorrenciaId: string, aPartirDe: Date, db: Db = DataSource) {
    return db.lancamento.deleteMany({ where: { recorrenciaId, data: { gte: aPartirDe } } });
  }
}

export default new GastosFixosRepository();
