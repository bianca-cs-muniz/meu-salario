import DataSource from "@database/data-source";
import { categoriaSelect } from "@database/selects";
import { CreateCategoriaDto } from "./dtos/create.dto";
import { UpdateCategoriaDto } from "./dtos/update.dto";

class CategoriasRepository {
  private repository = DataSource.categoria;

  read(usuarioId: string) {
    return this.repository.findMany({ where: { usuarioId }, select: categoriaSelect, orderBy: [{ grupo: "asc" }, { nome: "asc" }] });
  }

  readById(usuarioId: string, id: string) {
    return this.repository.findFirst({ where: { id, usuarioId }, select: categoriaSelect });
  }

  readByNome(usuarioId: string, nome: string, excetoId?: string) {
    return this.repository.findFirst({
      where: { usuarioId, nome: { equals: nome, mode: "insensitive" }, ...(excetoId ? { id: { not: excetoId } } : {}) },
      select: { id: true },
    });
  }

  /** Gasto (SAIDA de qualquer forma, inclusive VR) por categoria na competência. */
  gastos(usuarioId: string, competencia: string) {
    return DataSource.lancamento.groupBy({
      by: ["categoriaId"],
      where: { usuarioId, competencia, tipo: "SAIDA", categoriaId: { not: null } },
      _sum: { valorCentavos: true },
    });
  }

  create(usuarioId: string, data: CreateCategoriaDto) {
    return this.repository.create({ data: { ...data, usuarioId }, select: categoriaSelect });
  }

  update(id: string, data: UpdateCategoriaDto) {
    return this.repository.update({ where: { id }, data, select: categoriaSelect });
  }
}

export default new CategoriasRepository();
