import { httpClient } from '@services/httpClient';
import type { IFaturaDetalhe, IFaturaResumo } from '@services/tipos';

class FaturasService {
  httpClient;
  path: string;

  constructor() {
    this.httpClient = httpClient;
    this.path = '/faturas';
  }

  async buscar(cartaoId: string, competencia: string): Promise<IFaturaDetalhe> {
    const { data } = await this.httpClient.get<IFaturaDetalhe>(this.path, { params: { cartaoId, competencia } });
    return data;
  }

  async historico(cartaoId: string): Promise<IFaturaResumo[]> {
    const { data } = await this.httpClient.get<IFaturaResumo[]>(`${this.path}/cartao/${cartaoId}`);
    return data;
  }

  async pagar(id: string): Promise<IFaturaResumo> {
    const { data } = await this.httpClient.post<IFaturaResumo>(`${this.path}/${id}/pagar`);
    return data;
  }

  async desfazerPagamento(id: string): Promise<IFaturaResumo> {
    const { data } = await this.httpClient.post<IFaturaResumo>(`${this.path}/${id}/desfazer-pagamento`);
    return data;
  }
}

export default new FaturasService();
