import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import Repository from "./lancamentos.repository";
import FaturasService, { CartaoCiclo } from "@modulos/faturas/faturas.service";
import ResumoService from "@modulos/resumo/resumo.service";
import { CreateLancamentoDto } from "./dtos/create.dto";
import { UpdateLancamentoDto } from "./dtos/update.dto";
import { ReadLancamentoDto } from "./dtos/read.dto";
import AppException from "@erros/app-exception";
import ErrorMessages from "@erros/error-messages";
import { cicloDoCartao, competenciaAtual, competenciaDe, interpretarData } from "@helpers/competencia.helper";
import { descricaoDaParcela, dividirEmParcelas } from "@helpers/parcelas.helper";

type Tipo = "ENTRADA" | "SAIDA";
type Forma = "PIX" | "DEBITO" | "DINHEIRO" | "CREDITO" | "VR";

export type VinculosPedidos = { tipo: Tipo; formaPagamento: Forma; categoriaId?: string; carteiraId?: string; cartaoId?: string };
export type Vinculos = { categoriaId: string | null; carteiraId: string | null; cartao: CartaoCiclo | null };

class LancamentosService {
  /**
   * Confere e resolve categoria, carteira e cartão (todos precisam ser do usuário, senão 404).
   * SAIDA exige categoria; SAIDA com VR exige categoria que aceita VR.
   * Carteira: VR → carteira VR ativa; CREDITO → nenhuma; demais → a informada (nunca a VR) ou a Conta principal.
   * Cartão (só no CREDITO): o informado ou o primeiro cartão ativo.
   * Também usado pelos gastos fixos.
   */
  async resolverVinculos(usuarioId: string, pedido: VinculosPedidos): Promise<Vinculos> {
    const categoria = pedido.categoriaId ? await Repository.readCategoria(usuarioId, pedido.categoriaId) : null;
    if (pedido.categoriaId && !categoria) throw new AppException(404, ErrorMessages.REGISTRO_NAO_ENCONTRADO);
    if (pedido.tipo === "SAIDA" && !categoria) throw new AppException(400, ErrorMessages.ESCOLHA_CATEGORIA);
    if (pedido.tipo === "SAIDA" && pedido.formaPagamento === "VR" && !categoria?.aceitaVr) throw new AppException(400, ErrorMessages.CATEGORIA_NAO_ACEITA_VR);

    let carteiraId: string | null = null;
    if (pedido.formaPagamento === "VR") {
      const vr = await Repository.readCarteiraVrAtiva(usuarioId);
      if (!vr) throw new AppException(400, ErrorMessages.CADASTRE_CARTEIRA_VR);
      carteiraId = vr.id;
    } else if (pedido.formaPagamento !== "CREDITO") {
      if (pedido.carteiraId) {
        const carteira = await Repository.readCarteira(usuarioId, pedido.carteiraId);
        if (!carteira) throw new AppException(404, ErrorMessages.REGISTRO_NAO_ENCONTRADO);
        if (carteira.tipo === "VR") throw new AppException(400, ErrorMessages.CARTEIRA_VR_SO_COM_VR);
        carteiraId = carteira.id;
      } else {
        carteiraId = (await Repository.readContaPrincipal(usuarioId))?.id ?? null;
      }
    }

    let cartao: CartaoCiclo | null = null;
    if (pedido.formaPagamento === "CREDITO") {
      if (pedido.cartaoId) {
        cartao = await Repository.readCartao(usuarioId, pedido.cartaoId);
        if (!cartao) throw new AppException(404, ErrorMessages.REGISTRO_NAO_ENCONTRADO);
      } else {
        cartao = await Repository.readPrimeiroCartaoAtivo(usuarioId);
        if (!cartao) throw new AppException(400, ErrorMessages.ESCOLHA_CARTAO);
      }
    }

    return { categoriaId: categoria?.id ?? null, carteiraId, cartao };
  }

  async read(usuarioId: string, filtro: ReadLancamentoDto) {
    return Repository.read(usuarioId, filtro);
  }

  async readById(usuarioId: string, id: string) {
    const lancamento = await Repository.readById(usuarioId, id);
    if (!lancamento) throw new AppException(404, ErrorMessages.REGISTRO_NAO_ENCONTRADO);
    return lancamento;
  }

  /** POST /lancamentos — cria (em parcelas, no crédito) e devolve o impacto no mês. */
  async create(usuarioId: string, dto: CreateLancamentoDto) {
    const vinculos = await this.resolverVinculos(usuarioId, dto);
    const data = dto.data ? interpretarData(dto.data) : new Date();
    const base = {
      usuarioId,
      tipo: dto.tipo,
      data,
      formaPagamento: dto.formaPagamento,
      categoriaId: vinculos.categoriaId,
      carteiraId: vinculos.carteiraId,
    };

    const criados = await Repository.transacao(async (tx) => {
      const cartao = vinculos.cartao;
      if (!cartao) {
        return [await Repository.create({ ...base, descricao: dto.descricao, valorCentavos: dto.valorCentavos, competencia: competenciaDe(data) }, tx)];
      }
      const primeira = cicloDoCartao(data, cartao.diaFechamento, cartao.diaVencimento).competencia;
      const parcelas = dividirEmParcelas(dto.descricao, dto.valorCentavos, dto.parcelas, primeira);
      const grupoParcelaId = parcelas.length > 1 ? randomUUID() : null;
      const lista = [];
      for (const parcela of parcelas) {
        lista.push(
          await Repository.create(
            {
              ...base,
              cartaoId: cartao.id,
              descricao: parcela.descricao,
              valorCentavos: parcela.valorCentavos,
              competencia: parcela.competencia,
              parcelaNumero: grupoParcelaId ? parcela.numero : null,
              parcelaTotal: grupoParcelaId ? parcela.total : null,
              grupoParcelaId,
            },
            tx,
          ),
        );
      }
      await FaturasService.garantir(usuarioId, lista, tx);
      return lista;
    });

    const primeiro = criados[0];
    const [sobraCentavos, fatura, saldoVrCentavos] = await Promise.all([
      ResumoService.sobra(usuarioId, primeiro.competencia),
      vinculos.cartao ? FaturasService.resumos(usuarioId, vinculos.cartao, [primeiro.competencia]).then(([f]) => f) : Promise.resolve(null),
      dto.formaPagamento === "VR" && vinculos.carteiraId ? ResumoService.saldoCarteira(usuarioId, vinculos.carteiraId, competenciaAtual()) : Promise.resolve(null),
    ]);

    return {
      lancamentos: criados,
      impacto: {
        sobraCentavos,
        faturaTotalCentavos: fatura?.totalCentavos ?? null,
        faturaCompetencia: fatura?.competencia ?? null,
        saldoVrCentavos,
        saldoInsuficiente: saldoVrCentavos !== null && saldoVrCentavos < 0,
      },
    };
  }

  /**
   * PUT /lancamentos/:id — com `aplicarEmParcelasFuturas`, vale para esta parcela e as seguintes.
   * A data só muda na parcela editada. Fora do crédito, competência e carteira são recalculadas;
   * no crédito sem parcela, a competência segue o ciclo do cartão quando data/cartão/forma mudam.
   * Lançamento de gasto fixo (recorrenciaId) mantém a competência original: o aluguel de outubro
   * pago em 01/11 continua sendo o de outubro. A edição nunca mexe em `mesRecorrencia`
   * (único recorrenciaId + mesRecorrencia).
   */
  async update(usuarioId: string, id: string, dto: UpdateLancamentoDto) {
    const lancamento = await this.readById(usuarioId, id);
    const { aplicarEmParcelasFuturas, ...campos } = dto;
    if (lancamento.grupoParcelaId && campos.formaPagamento && campos.formaPagamento !== lancamento.formaPagamento)
      throw new AppException(400, ErrorMessages.FORMA_PARCELADA_NAO_MUDA);

    const forma = campos.formaPagamento ?? lancamento.formaPagamento;
    const vinculos = await this.resolverVinculos(usuarioId, {
      tipo: campos.tipo ?? lancamento.tipo,
      formaPagamento: forma,
      categoriaId: campos.categoriaId ?? lancamento.categoriaId ?? undefined,
      carteiraId: campos.carteiraId ?? (forma === lancamento.formaPagamento ? lancamento.carteiraId ?? undefined : undefined),
      cartaoId: campos.cartaoId ?? lancamento.cartaoId ?? undefined,
    });

    const alvo =
      aplicarEmParcelasFuturas && lancamento.grupoParcelaId && lancamento.parcelaNumero
        ? await Repository.readGrupo(usuarioId, lancamento.grupoParcelaId, { gte: lancamento.parcelaNumero })
        : [lancamento];

    const salvar = Repository.transacao(async (tx) => {
      const atualizados = [];
      for (const item of alvo) {
        const ehEditado = item.id === lancamento.id;
        const data = ehEditado && campos.data ? interpretarData(campos.data) : item.data;
        const cartao = vinculos.cartao;
        const cartaoId = cartao ? (campos.cartaoId || !item.cartaoId ? cartao.id : item.cartaoId) : null;

        let competencia = item.competencia;
        if (item.recorrenciaId) competencia = item.competencia; // gasto fixo: só a data muda
        else if (!cartao) competencia = competenciaDe(data);
        else if (!item.grupoParcelaId && (campos.data || cartaoId !== item.cartaoId || item.formaPagamento !== "CREDITO"))
          competencia = cicloDoCartao(data, cartao.diaFechamento, cartao.diaVencimento).competencia;

        const descricao = campos.descricao
          ? item.parcelaTotal && item.parcelaNumero
            ? descricaoDaParcela(campos.descricao, item.parcelaNumero, item.parcelaTotal)
            : campos.descricao
          : item.descricao;

        atualizados.push(
          await Repository.update(
            item.id,
            {
              tipo: campos.tipo ?? item.tipo,
              descricao,
              valorCentavos: campos.valorCentavos ?? item.valorCentavos,
              data,
              competencia,
              formaPagamento: forma,
              categoriaId: campos.categoriaId ? vinculos.categoriaId : item.categoriaId,
              carteiraId: vinculos.carteiraId,
              cartaoId,
              revisado: campos.revisado ?? item.revisado,
            },
            tx,
          ),
        );
      }
      await FaturasService.garantir(usuarioId, atualizados, tx);
    });
    await salvar.catch((erro: unknown) => {
      if (lancamento.recorrenciaId && erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002")
        throw new AppException(409, ErrorMessages.FIXO_JA_LANCADO_NO_MES);
      throw erro;
    });

    return this.readById(usuarioId, lancamento.id);
  }

  /** DELETE /lancamentos/:id — com `parcelasFuturas`, apaga também as parcelas seguintes do grupo. */
  async delete(usuarioId: string, id: string, parcelasFuturas = false) {
    const lancamento = await this.readById(usuarioId, id);
    const ids = [lancamento.id];
    if (parcelasFuturas && lancamento.grupoParcelaId && lancamento.parcelaNumero) {
      const seguintes = await Repository.readGrupo(usuarioId, lancamento.grupoParcelaId, { gt: lancamento.parcelaNumero });
      ids.push(...seguintes.map((l) => l.id));
    }
    await Repository.delete(usuarioId, ids);
  }

  async revisar(usuarioId: string, id: string) {
    const lancamento = await this.readById(usuarioId, id);
    return Repository.update(lancamento.id, { revisado: true });
  }
}

export default new LancamentosService();
