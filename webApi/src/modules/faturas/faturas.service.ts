import Repository from "./faturas.repository";
import { ReadFaturaDto } from "./dtos/read.dto";
import { Db } from "@database/selects";
import AppException from "@erros/app-exception";
import ErrorMessages from "@erros/error-messages";
import { cicloDaCompetencia, cicloDoCartao, competenciaAtual, deslocarCompetencia } from "@helpers/competencia.helper";
import { statusFatura, StatusFatura } from "@helpers/fatura.helper";

export type CartaoCiclo = { id: string; nome: string; cor: string; diaFechamento: number; diaVencimento: number };

export type FaturaResumo = {
  id: string | null;
  cartaoId: string;
  competencia: string;
  fechamento: string;
  vencimento: string;
  pagaEm: string | null;
  totalCentavos: number;
  status: StatusFatura;
  cartao: { id: string; nome: string; cor: string };
};

type Registro = { id: string; pagaEm: Date | null };
type Total = { totalCentavos: number; quantidade: number };

const chave = (cartaoId: string, competencia: string) => `${cartaoId}:${competencia}`;

class FaturasService {
  /** Monta a fatura de um cartão numa competência. Fechamento, vencimento e status vêm sempre do cartão. */
  montar(cartao: CartaoCiclo, competencia: string, registro: Registro | undefined, totalCentavos: number, agora = new Date()): FaturaResumo {
    const ciclo = cicloDaCompetencia(competencia, cartao.diaFechamento, cartao.diaVencimento);
    const pagaEm = registro?.pagaEm ?? null;
    return {
      id: registro?.id ?? null,
      cartaoId: cartao.id,
      competencia,
      fechamento: ciclo.fechamento.toISOString(),
      vencimento: ciclo.vencimento.toISOString(),
      pagaEm: pagaEm ? pagaEm.toISOString() : null,
      totalCentavos,
      status: statusFatura(pagaEm, ciclo.fechamento, ciclo.vencimento, totalCentavos, agora),
      cartao: { id: cartao.id, nome: cartao.nome, cor: cartao.cor },
    };
  }

  /** Cria a linha Fatura (se ainda não existir) para cada par cartão + competência com lançamento de crédito. */
  async garantir(usuarioId: string, pares: { cartaoId: string | null; competencia: string }[], db?: Db) {
    const unicos = new Map<string, { cartaoId: string; competencia: string }>();
    for (const par of pares) if (par.cartaoId) unicos.set(chave(par.cartaoId, par.competencia), { cartaoId: par.cartaoId, competencia: par.competencia });
    if (!unicos.size) return;
    const cartaoIds = [...new Set([...unicos.values()].map((p) => p.cartaoId))];
    const cartoes = await Repository.readCartoes(usuarioId, cartaoIds, db);
    const dados = [...unicos.values()].flatMap((par) => {
      const cartao = cartoes.find((c) => c.id === par.cartaoId);
      if (!cartao) return [];
      const ciclo = cicloDaCompetencia(par.competencia, cartao.diaFechamento, cartao.diaVencimento);
      return [{ usuarioId, cartaoId: par.cartaoId, competencia: par.competencia, fechamento: ciclo.fechamento, vencimento: ciclo.vencimento }];
    });
    await Repository.createMany(dados, db);
  }

  /** Totais (SAIDA soma, ENTRADA desconta) e quantidade de itens por cartão + competência. */
  private async totais(usuarioId: string, cartaoIds: string[], competencias?: string[]) {
    const mapa = new Map<string, Total & { cartaoId: string; competencia: string }>();
    if (!cartaoIds.length) return mapa;
    const linhas = await Repository.totais(usuarioId, cartaoIds, competencias);
    for (const linha of linhas) {
      if (!linha.cartaoId) continue;
      const k = chave(linha.cartaoId, linha.competencia);
      const atual = mapa.get(k) ?? { cartaoId: linha.cartaoId, competencia: linha.competencia, totalCentavos: 0, quantidade: 0 };
      const valor = linha._sum.valorCentavos ?? 0;
      atual.totalCentavos += linha.tipo === "SAIDA" ? valor : -valor;
      atual.quantidade += linha._count._all;
      mapa.set(k, atual);
    }
    return mapa;
  }

  private async registros(usuarioId: string, cartaoIds: string[], competencias?: string[]) {
    const mapa = new Map<string, Registro>();
    if (!cartaoIds.length) return mapa;
    for (const r of await Repository.readByCartao(usuarioId, cartaoIds, competencias)) mapa.set(chave(r.cartaoId, r.competencia), r);
    return mapa;
  }

  /** Faturas de um cartão nas competências pedidas. */
  async resumos(usuarioId: string, cartao: CartaoCiclo, competencias: string[]): Promise<FaturaResumo[]> {
    const [totais, registros] = await Promise.all([
      this.totais(usuarioId, [cartao.id], competencias),
      this.registros(usuarioId, [cartao.id], competencias),
    ]);
    const agora = new Date();
    return competencias.map((competencia) => {
      const k = chave(cartao.id, competencia);
      return this.montar(cartao, competencia, registros.get(k), totais.get(k)?.totalCentavos ?? 0, agora);
    });
  }

  /** Faturas da competência dos cartões informados, só as que têm lançamentos. */
  async resumosComItens(usuarioId: string, cartoes: CartaoCiclo[], competencia: string): Promise<FaturaResumo[]> {
    const ids = cartoes.map((c) => c.id);
    const [totais, registros] = await Promise.all([this.totais(usuarioId, ids, [competencia]), this.registros(usuarioId, ids, [competencia])]);
    const agora = new Date();
    return cartoes.flatMap((cartao) => {
      const k = chave(cartao.id, competencia);
      const total = totais.get(k);
      return total?.quantidade ? [this.montar(cartao, competencia, registros.get(k), total.totalCentavos, agora)] : [];
    });
  }

  /**
   * Situação do cartão: fatura atual (menor competência não paga ≥ mês atual com itens; senão a
   * próxima em que uma compra de hoje cai), limite usado (todas as não pagas) e próximo ciclo.
   */
  async situacaoDoCartao(usuarioId: string, cartao: CartaoCiclo) {
    const [totais, registros] = await Promise.all([this.totais(usuarioId, [cartao.id]), this.registros(usuarioId, [cartao.id])]);
    const proximo = cicloDoCartao(new Date(), cartao.diaFechamento, cartao.diaVencimento);
    const atual = competenciaAtual();
    const naoPagas = [...totais.values()].filter((f) => f.quantidade > 0 && !registros.get(chave(cartao.id, f.competencia))?.pagaEm);
    const competenciaDaAtual =
      naoPagas
        .map((f) => f.competencia)
        .filter((c) => c >= atual)
        .sort()[0] ?? proximo.competencia;
    const k = chave(cartao.id, competenciaDaAtual);
    return {
      faturaAtual: this.montar(cartao, competenciaDaAtual, registros.get(k), totais.get(k)?.totalCentavos ?? 0),
      limiteUsadoCentavos: naoPagas.reduce((soma, f) => soma + f.totalCentavos, 0),
      proximaCompetencia: proximo.competencia,
      proximoVencimento: proximo.vencimento.toISOString(),
    };
  }

  async buscarCartao(usuarioId: string, cartaoId: string): Promise<CartaoCiclo> {
    const cartao = await Repository.readCartao(usuarioId, cartaoId);
    if (!cartao) throw new AppException(404, ErrorMessages.REGISTRO_NAO_ENCONTRADO);
    return cartao;
  }

  /** GET /faturas?cartaoId&competencia */
  async read(usuarioId: string, { cartaoId, competencia }: ReadFaturaDto) {
    const cartao = await this.buscarCartao(usuarioId, cartaoId);
    const proximasCompetencias = [1, 2, 3].map((n) => deslocarCompetencia(competencia, n));
    const [itens, [fatura, ...proximas]] = await Promise.all([
      Repository.itens(usuarioId, cartao.id, competencia),
      this.resumos(usuarioId, cartao, [competencia, ...proximasCompetencias]),
    ]);

    const totalPorCategoria = new Map<string, { categoriaId: string; nome: string; icone: string; cor: string; totalCentavos: number }>();
    for (const item of itens) {
      if (!item.categoria) continue;
      const atual = totalPorCategoria.get(item.categoria.id) ?? {
        categoriaId: item.categoria.id,
        nome: item.categoria.nome,
        icone: item.categoria.icone,
        cor: item.categoria.cor,
        totalCentavos: 0,
      };
      atual.totalCentavos += item.tipo === "SAIDA" ? item.valorCentavos : -item.valorCentavos;
      totalPorCategoria.set(item.categoria.id, atual);
    }

    return {
      ...fatura,
      fixos: itens.filter((l) => l.recorrenciaId),
      parcelas: itens.filter((l) => !l.recorrenciaId && l.grupoParcelaId),
      avulsos: itens.filter((l) => !l.recorrenciaId && !l.grupoParcelaId),
      porCategoria: [...totalPorCategoria.values()].sort((a, b) => b.totalCentavos - a.totalCentavos),
      proximas: proximas.map((f) => ({ competencia: f.competencia, totalCentavos: f.totalCentavos })),
    };
  }

  /** GET /faturas/cartao/:id — de 11 meses atrás até 3 meses à frente. */
  async readByCartao(usuarioId: string, cartaoId: string) {
    const cartao = await this.buscarCartao(usuarioId, cartaoId);
    const atual = competenciaAtual();
    const competencias = Array.from({ length: 15 }, (_, i) => deslocarCompetencia(atual, i - 11));
    return this.resumos(usuarioId, cartao, competencias);
  }

  async pagar(usuarioId: string, id: string) {
    return this.marcarPagamento(usuarioId, id, new Date());
  }

  async desfazerPagamento(usuarioId: string, id: string) {
    return this.marcarPagamento(usuarioId, id, null);
  }

  private async marcarPagamento(usuarioId: string, id: string, pagaEm: Date | null) {
    const registro = await Repository.readById(usuarioId, id);
    if (!registro) throw new AppException(404, ErrorMessages.REGISTRO_NAO_ENCONTRADO);
    await Repository.update(registro.id, pagaEm);
    const cartao = await this.buscarCartao(usuarioId, registro.cartaoId);
    const [fatura] = await this.resumos(usuarioId, cartao, [registro.competencia]);
    return fatura;
  }
}

export default new FaturasService();
