import { Prisma } from "@prisma/client";
import DataSource from "@database/data-source";
import { usuarioSelect } from "@database/selects";
import { RegistrarDto } from "./dtos/registrar.dto";
import { PerfilDto } from "./dtos/perfil.dto";
import { categoriasPadrao } from "../categorias/categorias.padrao";
const categorias: Prisma.CategoriaCreateWithoutUsuarioInput[] = categoriasPadrao.map((categoria) => ({ ...categoria }));
class Repository {
  buscarPorEmail(email: string) { return DataSource.usuario.findUnique({ where: { email } }); }
  criar(data: RegistrarDto & { senha: string }) {
    return DataSource.usuario.create({ data: { ...data, carteiras: { create: { nome: "Conta principal", tipo: "CONTA" }, }, categorias: { create: categorias }, }, include: { carteiras: true, categorias: true }, });
  }
  readById(id: string) { return DataSource.usuario.findUnique({ where: { id }, select: usuarioSelect }); }
  buscarPorTelefone(telefoneWhatsapp: string, excetoId: string) { return DataSource.usuario.findFirst({ where: { telefoneWhatsapp, id: { not: excetoId } }, select: { id: true } }); }
  update(id: string, data: PerfilDto) { return DataSource.usuario.update({ where: { id }, data, select: usuarioSelect }); }
}
export default new Repository();
