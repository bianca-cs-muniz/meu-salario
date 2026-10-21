import DataSource from "@database/data-source";
import { carteiraSelect } from "@database/selects";
import { CreateCarteiraDto } from "./dtos/create.dto";
import { UpdateCarteiraDto } from "./dtos/update.dto";

class CarteirasRepository {
  private repository = DataSource.carteira;

  read(usuarioId: string) {
    return this.repository.findMany({ where: { usuarioId }, select: carteiraSelect, orderBy: { criadoEm: "asc" } });
  }

  readById(usuarioId: string, id: string) {
    return this.repository.findFirst({ where: { id, usuarioId }, select: carteiraSelect });
  }

  readVrAtiva(usuarioId: string, excetoId?: string) {
    return this.repository.findFirst({ where: { usuarioId, tipo: "VR", ativa: true, ...(excetoId ? { id: { not: excetoId } } : {}) }, select: carteiraSelect });
  }

  create(usuarioId: string, data: CreateCarteiraDto) {
    return this.repository.create({ data: { ...data, usuarioId }, select: carteiraSelect });
  }

  update(id: string, data: UpdateCarteiraDto) {
    return this.repository.update({ where: { id }, data, select: carteiraSelect });
  }
}

export default new CarteirasRepository();
