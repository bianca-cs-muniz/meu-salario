import HttpClient from "../HttpClient";
import { ICarteira, TipoCarteira } from "../tipos";

class CarteirasService {
  private httpClient = new HttpClient();
  private path = "/carteiras";

  async listar(): Promise<ICarteira[]> {
    return await this.httpClient.get<ICarteira[]>(this.path);
  }

  async criar(data: { nome: string; tipo: TipoCarteira }): Promise<ICarteira> {
    return await this.httpClient.post<ICarteira>(this.path, data);
  }

  async editar(id: string, data: { nome?: string; ativa?: boolean }): Promise<ICarteira> {
    return await this.httpClient.put<ICarteira>(`${this.path}/${id}`, data);
  }
}

export default new CarteirasService();
