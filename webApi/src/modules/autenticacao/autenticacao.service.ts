import Repository from "./autenticacao.repository";
import { RegistrarDto } from "./dtos/registrar.dto";
import { LoginDto } from "./dtos/login.dto";
import { PerfilDto } from "./dtos/perfil.dto";
import SenhaHelper from "@helpers/senha.helper";
import TokenHelper from "@helpers/token.helper";
import AppException from "@erros/app-exception";
import ErrorMessages from "@erros/error-messages";

type UsuarioCompleto = { id: string; email: string; nome: string; telefoneWhatsapp: string | null };
const paraApi = (u: UsuarioCompleto) => ({ id: u.id, email: u.email, nome: u.nome, telefoneWhatsapp: u.telefoneWhatsapp });

class Service {
  async registrar(data: RegistrarDto) {
    if (await Repository.buscarPorEmail(data.email)) throw new AppException(409, ErrorMessages.CONTA_JA_EXISTE);
    const usuario = await Repository.criar({ ...data, senha: SenhaHelper.gerarHash(data.senha) });
    return { token: TokenHelper.criarToken({ id: usuario.id }), usuario: paraApi(usuario) };
  }

  async login(data: LoginDto) {
    const usuario = await Repository.buscarPorEmail(data.email);
    if (!usuario || !SenhaHelper.compararComHash(data.senha, usuario.senha)) throw new AppException(401, ErrorMessages.CREDENCIAIS_INVALIDAS);
    return { token: TokenHelper.criarToken({ id: usuario.id }), usuario: paraApi(usuario) };
  }

  async perfil(usuarioId: string) {
    const usuario = await Repository.readById(usuarioId);
    if (!usuario) throw new AppException(404, ErrorMessages.USUARIO_NAO_ENCONTRADO);
    return usuario;
  }

  async atualizarPerfil(usuarioId: string, data: PerfilDto) {
    await this.perfil(usuarioId);
    if (data.telefoneWhatsapp && (await Repository.buscarPorTelefone(data.telefoneWhatsapp, usuarioId))) throw new AppException(409, ErrorMessages.TELEFONE_JA_USADO);
    return Repository.update(usuarioId, data);
  }
}

export default new Service();
