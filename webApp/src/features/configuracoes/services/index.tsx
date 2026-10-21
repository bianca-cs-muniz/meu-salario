import { httpClient } from '@services/httpClient';
import type { ICarteira, TipoCarteira } from '@services/tipos';

class CarteirasService {
  httpClient;
  path: string;

  constructor() {
    this.httpClient = httpClient;
    this.path = '/carteiras';
  }

  async listar(): Promise<ICarteira[]> {
    const { data } = await this.httpClient.get<ICarteira[]>(this.path);
    return data;
  }

  async criar(dto: { nome: string; tipo: TipoCarteira }): Promise<ICarteira> {
    const { data } = await this.httpClient.post<ICarteira>(this.path, dto);
    return data;
  }

  async editar(id: string, dto: { nome?: string; ativa?: boolean }): Promise<ICarteira> {
    const { data } = await this.httpClient.put<ICarteira>(`${this.path}/${id}`, dto);
    return data;
  }
}

export default new CarteirasService();
