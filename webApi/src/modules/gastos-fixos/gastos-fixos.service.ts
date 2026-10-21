import { Prisma } from "@prisma/client";
import Repository from "./gastos-fixos.repository";
import LancamentosService from "@modulos/lancamentos/lancamentos.service";
import FaturasService from "@modulos/faturas/faturas.service";
import { CreateGastoFixoDto } from "./dtos/create.dto";
import { UpdateGastoFixoDto } from "./dtos/update.dto";
import { camposDoLancamentoFuturo, competenciasAGerar, lancamentoDoMes } from "./recorrencias.calculo";
import AppException from "@erros/app-exception";
import ErrorMessages from "@erros/error-messages";
import { competenciaAtual, deslocarCompetencia, inicioDeAmanha } from "@helpers/competencia.helper";

class GastosFixosService {
  async read(usuarioId: string, tipo?: "ENTRADA" | "SAIDA") {
    return Repository.read(usuarioId, tipo);
  }

  async readById(usuarioId: string, id: string) {
    const recorrencia = await Repository.readById(usuarioId, id);
    if (!recorrencia) throw new AppException(404, ErrorMessages.REGISTRO_NAO_ENCONTRADO);
    return recorrencia;
  }

  /** POST /gastos-fixos — começa no mês atual e já gera os lançamentos. */
  async create(usuarioId: string, dto: CreateGastoFixoDto) {
    const vinculos = await LancamentosService.resolverVinculos(usuarioId, dto);
    const recorrencia = await Repository.create({
      usuarioId,
      tipo: dto.tipo,
      descricao: dto.descricao,
      valorCentavos: dto.valorCentavos,
      diaDoMes: dto.diaDoMes,
      formaPagamento: dto.formaPagamento,
      categoriaId: vinculos.categoriaId,
      carteiraId: vinculos.carteiraId,
      cartaoId: vinculos.cartao?.id ?? null,
      inicio: competenciaAtual(),
    });
    await this.gerarPendentes(usuarioId);
    return recorrencia;
  }

  /**
   * PUT /gastos-fixos/:id — os lançamentos já gerados com data a partir de amanhã recebem descrição,
   * forma, cartão, carteira, categoria, data (novo dia, sem ir para o passado) e competência novos;
   * o valor só muda nos que ainda têm o valor antigo (preserva edição manual). Ver camposDoLancamentoFuturo.
   */
  async update(usuarioId: string, id: string, dto: UpdateGastoFixoDto) {
    const atual = await this.readById(usuarioId, id);
    const forma = dto.formaPagamento ?? atual.formaPagamento;
    const vinculos = await LancamentosService.resolverVinculos(usuarioId, {
      tipo: dto.tipo ?? atual.tipo,
      formaPagamento: forma,
      categoriaId: dto.categoriaId ?? atual.categoriaId ?? undefined,
      carteiraId: dto.carteiraId ?? (forma === atual.formaPagamento ? atual.carteiraId ?? undefined : undefined),
      cartaoId: dto.cartaoId ?? atual.cartaoId ?? undefined,
    });
    const recorrencia = await Repository.transacao(async (tx) => {
      const atualizada = await Repository.update(
        id,
        {
          tipo: dto.tipo,
          descricao: dto.descricao,
          valorCentavos: dto.valorCentavos,
          diaDoMes: dto.diaDoMes,
          formaPagamento: dto.formaPagamento,
          categoriaId: vinculos.categoriaId,
          carteiraId: vinculos.carteiraId,
          cartaoId: vinculos.cartao?.id ?? null,
        },
        tx,
      );
      const aPartirDe = inicioDeAmanha();
      const fixo = {
        descricao: atualizada.descricao,
        valorCentavos: atualizada.valorCentavos,
        valorAntigo: atual.valorCentavos,
        novoDiaDoMes: atualizada.diaDoMes !== atual.diaDoMes ? atualizada.diaDoMes : null,
        formaPagamento: atualizada.formaPagamento,
        categoriaId: vinculos.categoriaId,
        carteiraId: vinculos.carteiraId,
        cartao: vinculos.cartao,
      };
      const futuros = await Repository.readFuturos(id, aPartirDe, tx);
      const atualizados = [];
      for (const lancamento of futuros)
        atualizados.push(await Repository.updateLancamento(lancamento.id, camposDoLancamentoFuturo(lancamento, fixo, aPartirDe), tx));
      await FaturasService.garantir(usuarioId, atualizados, tx);
      return atualizada;
    });
    await this.gerarPendentes(usuarioId);
    return recorrencia;
  }

  /**
   * DELETE /gastos-fixos/:id — encerra no mês atual e apaga os lançamentos com data de cobrança a
   * partir de amanhã (no crédito, a competência pode ser de um mês seguinte mesmo já cobrado).
   */
  async delete(usuarioId: string, id: string) {
    await this.readById(usuarioId, id);
    await Repository.transacao(async (tx) => {
      await Repository.update(id, { fim: competenciaAtual(), ativa: false }, tx);
      await Repository.deleteFuturos(id, inicioDeAmanha(), tx);
    });
  }

  /**
   * Gera os lançamentos dos fixos ativos até o mês que vem (atual + 1).
   * `geradaAte` guarda o último mês gerado: um lançamento de fixo excluído não volta.
   * `skipDuplicates` (único em recorrenciaId + mesRecorrencia) protege contra requisições simultâneas.
   */
  async gerarPendentes(usuarioId: string) {
    const atual = competenciaAtual();
    const pendentes = await Repository.readPendentes(usuarioId, deslocarCompetencia(atual, 1));
    if (!pendentes.length) return;

    const lancamentos: Prisma.LancamentoCreateManyInput[] = [];
    const geradas: { id: string; ate: string }[] = [];
    for (const r of pendentes) {
      const meses = competenciasAGerar(r, atual);
      if (!meses.length) continue;
      for (const mes of meses) {
        const cartao = r.formaPagamento === "CREDITO" ? r.cartao : null;
        const { data, competencia, mesRecorrencia } = lancamentoDoMes(mes, r.diaDoMes, cartao);
        lancamentos.push({
          usuarioId,
          tipo: r.tipo,
          descricao: r.descricao,
          valorCentavos: r.valorCentavos,
          data,
          competencia,
          formaPagamento: r.formaPagamento,
          categoriaId: r.categoriaId,
          carteiraId: r.carteiraId,
          cartaoId: cartao ? r.cartaoId : null,
          recorrenciaId: r.id,
          mesRecorrencia,
          origem: "RECORRENCIA",
        });
      }
      geradas.push({ id: r.id, ate: meses[meses.length - 1] });
    }
    if (!geradas.length) return;

    await Repository.transacao(async (tx) => {
      await Repository.createLancamentos(lancamentos, tx);
      await FaturasService.garantir(
        usuarioId,
        lancamentos.map((l) => ({ cartaoId: l.cartaoId ?? null, competencia: l.competencia })),
        tx,
      );
      for (const g of geradas) await Repository.update(g.id, { geradaAte: g.ate }, tx);
    });
  }
}

export default new GastosFixosService();
