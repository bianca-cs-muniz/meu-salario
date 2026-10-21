import DataSource from "@database/data-source";
import { cartaoSelect } from "@database/selects";
import { CreateCartaoDto } from "./dtos/create.dto";
import { UpdateCartaoDto } from "./dtos/update.dto";

class CartoesRepository {
  private repository = DataSource.cartao;

  read(usuarioId: string) {
    return this.repository.findMany({ where: { usuarioId }, select: cartaoSelect, orderBy: { criadoEm: "asc" } });
  }

  readById(usuarioId: string, id: string) {
    return this.repository.findFirst({ where: { id, usuarioId }, select: cartaoSelect });
  }

  create(usuarioId: string, data: CreateCartaoDto) {
    return this.repository.create({ data: { ...data, usuarioId }, select: cartaoSelect });
  }

  update(id: string, data: UpdateCartaoDto) {
    return this.repository.update({ where: { id }, data, select: cartaoSelect });
  }

  delete(id: string) {
    return this.repository.delete({ where: { id } });
  }

  /** O cartão tem lançamentos ou gastos fixos ligados a ele? */
  async temVinculos(id: string) {
    const [lancamentos, recorrencias] = await Promise.all([
      DataSource.lancamento.count({ where: { cartaoId: id } }),
      DataSource.recorrencia.count({ where: { cartaoId: id } }),
    ]);
    return lancamentos > 0 || recorrencias > 0;
  }
}

export default new CartoesRepository();
