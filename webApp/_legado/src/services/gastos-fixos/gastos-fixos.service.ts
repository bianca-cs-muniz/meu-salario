import HttpClient from "../HttpClient";
import { IRecorrencia, ISalvarRecorrencia, TipoLancamento } from "../tipos";

class GastosFixosService {
  private httpClient = new HttpClient();
  private path = "/gastos-fixos";

  async listar(tipo?: TipoLancamento): Promise<IRecorrencia[]> {
    const qs = tipo ? `?tipo=${tipo}` : "";
    return await this.httpClient.get<IRecorrencia[]>(`${this.path}${qs}`);
  }

  async criar(data: ISalvarRecorrencia): Promise<IRecorrencia> {
    return await this.httpClient.post<IRecorrencia>(this.path, data);
  }

  async editar(id: string, data: Partial<ISalvarRecorrencia>): Promise<IRecorrencia> {
    return await this.httpClient.put<IRecorrencia>(`${this.path}/${id}`, data);
  }

  /** Encerra a recorrência: some dos meses futuros, fica nos passados. */
  async encerrar(id: string): Promise<void> {
    await this.httpClient.delete(`${this.path}/${id}`);
  }
}

export default new GastosFixosService();
