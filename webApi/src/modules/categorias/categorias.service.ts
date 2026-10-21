import Repository from "./categorias.repository";
import { CreateCategoriaDto } from "./dtos/create.dto";
import { UpdateCategoriaDto } from "./dtos/update.dto";
import AppException from "@erros/app-exception";
import ErrorMessages from "@erros/error-messages";

class CategoriasService {
  /** Ordem: grupo, nome. `gastoCentavos` só é calculado quando a competência é informada. */
  async read(usuarioId: string, competencia?: string) {
    const [categorias, gastos] = await Promise.all([Repository.read(usuarioId), competencia ? Repository.gastos(usuarioId, competencia) : Promise.resolve([])]);
    const gastoPorCategoria = new Map(gastos.map((g) => [g.categoriaId, g._sum.valorCentavos ?? 0]));
    return categorias.map((c) => ({ ...c, gastoCentavos: gastoPorCategoria.get(c.id) ?? 0 }));
  }

  async readById(usuarioId: string, id: string) {
    const categoria = await Repository.readById(usuarioId, id);
    if (!categoria) throw new AppException(404, ErrorMessages.REGISTRO_NAO_ENCONTRADO);
    return categoria;
  }

  async create(usuarioId: string, data: CreateCategoriaDto) {
    if (await Repository.readByNome(usuarioId, data.nome)) throw new AppException(409, ErrorMessages.CATEGORIA_JA_EXISTE);
    return { ...(await Repository.create(usuarioId, data)), gastoCentavos: 0 };
  }

  async update(usuarioId: string, id: string, data: UpdateCategoriaDto) {
    await this.readById(usuarioId, id);
    if (data.nome && (await Repository.readByNome(usuarioId, data.nome, id))) throw new AppException(409, ErrorMessages.CATEGORIA_JA_EXISTE);
    return { ...(await Repository.update(id, data)), gastoCentavos: 0 };
  }
}

export default new CategoriasService();
