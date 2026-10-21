import { httpClient } from '@services/httpClient';
import type { ICartao } from '@services/tipos';

export interface ISalvarCartao {
  nome: string;
  diaFechamento: number;
  diaVencimento: number;
  limiteCentavos: number | null;
  cor: string;
}

class CartoesService {
  httpClient;
  path: string;

  constructor() {
    this.httpClient = httpClient;
    this.path = '/cartoes';
  }

  async listar(): Promise<ICartao[]> {
    const { data } = await this.httpClient.get<ICartao[]>(this.path);
    return data;
  }

  async criar(dto: ISalvarCartao): Promise<ICartao> {
    const { data } = await this.httpClient.post<ICartao>(this.path, dto);
    return data;
  }

  async editar(id: string, dto: Partial<ISalvarCartao> & { ativo?: boolean }): Promise<ICartao> {
    const { data } = await this.httpClient.put<ICartao>(`${this.path}/${id}`, dto);
    return data;
  }

  async excluir(id: string): Promise<void> {
    await this.httpClient.delete(`${this.path}/${id}`);
  }
}

export default new CartoesService();
