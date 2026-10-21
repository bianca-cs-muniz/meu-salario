import Repository from "./carteiras.repository";
import ResumoService from "@modulos/resumo/resumo.service";
import { CreateCarteiraDto } from "./dtos/create.dto";
import { UpdateCarteiraDto } from "./dtos/update.dto";
import AppException from "@erros/app-exception";
import ErrorMessages from "@erros/error-messages";
import { competenciaAtual } from "@helpers/competencia.helper";

type Carteira = { id: string; nome: string; tipo: "CONTA" | "VR"; ativa: boolean };

class CarteirasService {
  /** CONTA: sobra do mês atual · VR: saldo acumulado até o mês atual. */
  private async comSaldo(usuarioId: string, carteiras: Carteira[]) {
    const atual = competenciaAtual();
    const sobra = carteiras.some((c) => c.tipo === "CONTA") ? await ResumoService.sobra(usuarioId, atual) : 0;
    return Promise.all(
      carteiras.map(async (c) => ({ ...c, saldoCentavos: c.tipo === "VR" ? await ResumoService.saldoCarteira(usuarioId, c.id, atual) : sobra })),
    );
  }

  async read(usuarioId: string) {
    return this.comSaldo(usuarioId, await Repository.read(usuarioId));
  }

  async readById(usuarioId: string, id: string) {
    const carteira = await Repository.readById(usuarioId, id);
    if (!carteira) throw new AppException(404, ErrorMessages.REGISTRO_NAO_ENCONTRADO);
    return carteira;
  }

  async create(usuarioId: string, data: CreateCarteiraDto) {
    if (data.tipo === "VR" && (await Repository.readVrAtiva(usuarioId))) throw new AppException(409, ErrorMessages.VR_JA_EXISTE);
    const [carteira] = await this.comSaldo(usuarioId, [await Repository.create(usuarioId, data)]);
    return carteira;
  }

  async update(usuarioId: string, id: string, data: UpdateCarteiraDto) {
    const carteira = await this.readById(usuarioId, id);
    if (carteira.tipo === "VR" && data.ativa === true && (await Repository.readVrAtiva(usuarioId, id))) throw new AppException(409, ErrorMessages.VR_JA_EXISTE);
    const [atualizada] = await this.comSaldo(usuarioId, [await Repository.update(id, data)]);
    return atualizada;
  }
}

export default new CarteirasService();
