import Repository from "./cartoes.repository";
import FaturasService from "@modulos/faturas/faturas.service";
import { CreateCartaoDto } from "./dtos/create.dto";
import { UpdateCartaoDto } from "./dtos/update.dto";
import { CartaoApi } from "@database/selects";
import AppException from "@erros/app-exception";
import ErrorMessages from "@erros/error-messages";

class CartoesService {
  /** Cartão + fatura atual, limite usado e em que fatura cai uma compra de hoje. */
  private async completo(usuarioId: string, cartao: CartaoApi) {
    return { ...cartao, ...(await FaturasService.situacaoDoCartao(usuarioId, cartao)) };
  }

  async read(usuarioId: string) {
    const cartoes = await Repository.read(usuarioId);
    return Promise.all(cartoes.map((c) => this.completo(usuarioId, c)));
  }

  async readById(usuarioId: string, id: string) {
    const cartao = await Repository.readById(usuarioId, id);
    if (!cartao) throw new AppException(404, ErrorMessages.REGISTRO_NAO_ENCONTRADO);
    return cartao;
  }

  async create(usuarioId: string, data: CreateCartaoDto) {
    return this.completo(usuarioId, await Repository.create(usuarioId, data));
  }

  async update(usuarioId: string, id: string, data: UpdateCartaoDto) {
    await this.readById(usuarioId, id);
    return this.completo(usuarioId, await Repository.update(id, data));
  }

  /** Com lançamentos (ou gastos fixos) o cartão só é desativado; sem nada, é apagado. */
  async delete(usuarioId: string, id: string) {
    await this.readById(usuarioId, id);
    if (await Repository.temVinculos(id)) await Repository.update(id, { ativo: false });
    else await Repository.delete(id);
  }
}

export default new CartoesService();
