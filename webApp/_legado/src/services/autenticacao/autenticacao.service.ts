import HttpClient from "../HttpClient";
import LocalStorageService from "../localStorage.service";
import { IRespostaAuth, IUsuario } from "../tipos";

export interface IRegistrarDto {
  nome: string;
  email: string;
  senha: string;
}

export interface ILoginDto {
  email: string;
  senha: string;
}

export interface IAtualizarPerfilDto {
  nome?: string;
  telefoneWhatsapp?: string | null;
}

class AutenticacaoService {
  private httpClient = new HttpClient();
  private path = "/autenticacao";

  async registrar(data: IRegistrarDto): Promise<IRespostaAuth> {
    const res = await this.httpClient.post<IRespostaAuth>(`${this.path}/registrar`, data);
    LocalStorageService.salvarToken(res.token);
    return res;
  }

  async login(data: ILoginDto): Promise<IRespostaAuth> {
    const res = await this.httpClient.post<IRespostaAuth>(`${this.path}/login`, data);
    LocalStorageService.salvarToken(res.token);
    return res;
  }

  async perfil(): Promise<IUsuario> {
    return await this.httpClient.get<IUsuario>(`${this.path}/perfil`);
  }

  async atualizarPerfil(data: IAtualizarPerfilDto): Promise<IUsuario> {
    return await this.httpClient.put<IUsuario>(`${this.path}/perfil`, data);
  }

  sair() {
    LocalStorageService.removerToken();
  }
}

export default new AutenticacaoService();
