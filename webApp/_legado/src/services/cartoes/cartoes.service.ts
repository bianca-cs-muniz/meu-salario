import HttpClient from "../HttpClient";
import { ICartao } from "../tipos";

export interface ISalvarCartao {
  nome: string;
  diaFechamento: number;
  diaVencimento: number;
  limiteCentavos: number | null;
  cor: string;
}

class CartoesService {
  private httpClient = new HttpClient();
  private path = "/cartoes";

  async listar(): Promise<ICartao[]> {
    return await this.httpClient.get<ICartao[]>(this.path);
  }

  async criar(data: ISalvarCartao): Promise<ICartao> {
    return await this.httpClient.post<ICartao>(this.path, data);
  }

  async editar(id: string, data: Partial<ISalvarCartao> & { ativo?: boolean }): Promise<ICartao> {
    return await this.httpClient.put<ICartao>(`${this.path}/${id}`, data);
  }

  async excluir(id: string): Promise<void> {
    await this.httpClient.delete(`${this.path}/${id}`);
  }
}

export default new CartoesService();
