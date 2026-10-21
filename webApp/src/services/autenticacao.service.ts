import { httpClient } from './httpClient';
import type { IRespostaAuth, IUsuario } from './tipos';

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
  httpClient;
  path: string;

  constructor() {
    this.httpClient = httpClient;
    this.path = '/autenticacao';
  }

  async login(dto: ILoginDto): Promise<IRespostaAuth> {
    const { data } = await this.httpClient.post<IRespostaAuth>(`${this.path}/login`, dto);
    return data;
  }

  async registrar(dto: IRegistrarDto): Promise<IRespostaAuth> {
    const { data } = await this.httpClient.post<IRespostaAuth>(`${this.path}/registrar`, dto);
    return data;
  }

  async perfil(): Promise<IUsuario> {
    const { data } = await this.httpClient.get<IUsuario>(`${this.path}/perfil`);
    return data;
  }

  async atualizarPerfil(dto: IAtualizarPerfilDto): Promise<IUsuario> {
    const { data } = await this.httpClient.put<IUsuario>(`${this.path}/perfil`, dto);
    return data;
  }
}

export default new AutenticacaoService();
