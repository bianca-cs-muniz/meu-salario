import HttpClient from "../HttpClient";
import { IFaturaDetalhe, IFaturaResumo } from "../tipos";

class FaturasService {
  private httpClient = new HttpClient();
  private path = "/faturas";

  async buscar(cartaoId: string, competencia: string): Promise<IFaturaDetalhe> {
    return await this.httpClient.get<IFaturaDetalhe>(`${this.path}?cartaoId=${cartaoId}&competencia=${competencia}`);
  }

  async historico(cartaoId: string): Promise<IFaturaResumo[]> {
    return await this.httpClient.get<IFaturaResumo[]>(`${this.path}/cartao/${cartaoId}`);
  }

  async pagar(id: string): Promise<IFaturaResumo> {
    return await this.httpClient.post<IFaturaResumo>(`${this.path}/${id}/pagar`);
  }

  async desfazerPagamento(id: string): Promise<IFaturaResumo> {
    return await this.httpClient.post<IFaturaResumo>(`${this.path}/${id}/desfazer-pagamento`);
  }
}

export default new FaturasService();
