import { Prisma } from "@prisma/client";
import DataSource from "@database/data-source";
import { Db, lancamentoSelect } from "@database/selects";
import { ReadLancamentoDto } from "./dtos/read.dto";

/** Uso interno da edição: inclui `mesRecorrencia`, que nunca vai no JSON. */
const lancamentoEdicaoSelect = { ...lancamentoSelect, mesRecorrencia: true } satisfies Prisma.LancamentoSelect;

class LancamentosRepository {
  private repository = DataSource.lancamento;

  transacao<T>(fn: (tx: Db) => Promise<T>) {
    return DataSource.$transaction(fn);
  }

  read(usuarioId: string, filtro: ReadLancamentoDto) {
    return this.repository.findMany({
      where: {
        usuarioId,
        competencia: filtro.competencia,
        categoriaId: filtro.categoriaId,
        cartaoId: filtro.cartaoId,
        carteiraId: filtro.carteiraId,
        formaPagamento: filtro.formaPagamento,
        tipo: filtro.tipo,
        origem: filtro.origem,
        revisado: filtro.revisado,
        ...(filtro.busca ? { descricao: { contains: filtro.busca, mode: "insensitive" as const } } : {}),
      },
      select: lancamentoSelect,
      orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
    });
  }

  readById(usuarioId: string, id: string, db: Db = DataSource) {
    return db.lancamento.findFirst({ where: { id, usuarioId }, select: lancamentoSelect });
  }

  /** Igual ao readById, com `mesRecorrencia` (só para a edição; não devolver na API). */
  readParaEditar(usuarioId: string, id: string) {
    return this.repository.findFirst({ where: { id, usuarioId }, select: lancamentoEdicaoSelect });
  }

  /** Parcelas do mesmo grupo com número >= (ou >) ao informado (com `mesRecorrencia`, uso interno). */
  readGrupo(usuarioId: string, grupoParcelaId: string, numero: { gte: number } | { gt: number }) {
    return this.repository.findMany({
      where: { usuarioId, grupoParcelaId, parcelaNumero: numero },
      select: lancamentoEdicaoSelect,
      orderBy: { parcelaNumero: "asc" },
    });
  }

  create(data: Prisma.LancamentoUncheckedCreateInput, db: Db = DataSource) {
    return db.lancamento.create({ data, select: lancamentoSelect });
  }

  update(id: string, data: Prisma.LancamentoUncheckedUpdateInput, db: Db = DataSource) {
    return db.lancamento.update({ where: { id }, data, select: lancamentoSelect });
  }

  delete(usuarioId: string, ids: string[]) {
    return this.repository.deleteMany({ where: { usuarioId, id: { in: ids } } });
  }

  // ----- vínculos do usuário (categoria, carteira, cartão)
  readCategoria(usuarioId: string, id: string) {
    return DataSource.categoria.findFirst({ where: { id, usuarioId }, select: { id: true, aceitaVr: true } });
  }

  readCarteira(usuarioId: string, id: string) {
    return DataSource.carteira.findFirst({ where: { id, usuarioId }, select: { id: true, tipo: true } });
  }

  readCarteiraVrAtiva(usuarioId: string) {
    return DataSource.carteira.findFirst({ where: { usuarioId, tipo: "VR", ativa: true }, select: { id: true }, orderBy: { criadoEm: "asc" } });
  }

  /** "Conta principal": primeira carteira CONTA ativa (ou, se não houver, a primeira CONTA). */
  readContaPrincipal(usuarioId: string) {
    return DataSource.carteira.findFirst({
      where: { usuarioId, tipo: "CONTA" },
      select: { id: true },
      orderBy: [{ ativa: "desc" }, { criadoEm: "asc" }],
    });
  }

  readCartao(usuarioId: string, id: string) {
    return DataSource.cartao.findFirst({ where: { id, usuarioId }, select: { id: true, nome: true, cor: true, diaFechamento: true, diaVencimento: true } });
  }

  readPrimeiroCartaoAtivo(usuarioId: string) {
    return DataSource.cartao.findFirst({
      where: { usuarioId, ativo: true },
      select: { id: true, nome: true, cor: true, diaFechamento: true, diaVencimento: true },
      orderBy: { criadoEm: "asc" },
    });
  }
}

export default new LancamentosRepository();
