import { Prisma } from "@prisma/client";
import DataSource from "@database/data-source";
import { cartaoResumidoSelect, Db, lancamentoSelect } from "@database/selects";

const cartaoCicloSelect = { ...cartaoResumidoSelect, diaFechamento: true, diaVencimento: true } satisfies Prisma.CartaoSelect;

class FaturasRepository {
  private repository = DataSource.fatura;

  readById(usuarioId: string, id: string) {
    return this.repository.findFirst({ where: { id, usuarioId } });
  }

  readByCartao(usuarioId: string, cartaoIds: string[], competencias?: string[]) {
    return this.repository.findMany({
      where: { usuarioId, cartaoId: { in: cartaoIds }, ...(competencias ? { competencia: { in: competencias } } : {}) },
      select: { id: true, cartaoId: true, competencia: true, pagaEm: true },
    });
  }

  createMany(dados: Prisma.FaturaCreateManyInput[], db: Db = DataSource) {
    return db.fatura.createMany({ data: dados, skipDuplicates: true });
  }

  update(id: string, pagaEm: Date | null) {
    return this.repository.update({ where: { id }, data: { pagaEm } });
  }

  readCartao(usuarioId: string, cartaoId: string) {
    return DataSource.cartao.findFirst({ where: { id: cartaoId, usuarioId }, select: cartaoCicloSelect });
  }

  readCartoes(usuarioId: string, cartaoIds: string[], db: Db = DataSource) {
    return db.cartao.findMany({ where: { usuarioId, id: { in: cartaoIds } }, select: cartaoCicloSelect });
  }

  /** Soma por cartão, competência e tipo (o total da fatura nunca é gravado). */
  totais(usuarioId: string, cartaoIds: string[], competencias?: string[]) {
    return DataSource.lancamento.groupBy({
      by: ["cartaoId", "competencia", "tipo"],
      where: { usuarioId, cartaoId: { in: cartaoIds }, ...(competencias ? { competencia: { in: competencias } } : {}) },
      _sum: { valorCentavos: true },
      _count: { _all: true },
    });
  }

  itens(usuarioId: string, cartaoId: string, competencia: string) {
    return DataSource.lancamento.findMany({
      where: { usuarioId, cartaoId, competencia },
      select: lancamentoSelect,
      orderBy: [{ data: "asc" }, { criadoEm: "asc" }],
    });
  }
}

export default new FaturasRepository();
