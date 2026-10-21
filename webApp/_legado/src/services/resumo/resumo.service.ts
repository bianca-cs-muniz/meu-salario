import HttpClient from "../HttpClient";
import { IEvolucaoMes, IResumo } from "../tipos";

class ResumoService {
  private httpClient = new HttpClient();
  private path = "/resumo";

  async doMes(competencia: string): Promise<IResumo> {
    return await this.httpClient.get<IResumo>(`${this.path}?competencia=${competencia}`);
  }

  async evolucao(meses = 6): Promise<IEvolucaoMes[]> {
    return await this.httpClient.get<IEvolucaoMes[]>(`${this.path}/evolucao?meses=${meses}`);
  }
}

export default new ResumoService();
