import HttpClient from "../HttpClient";
import {
  ICriarLancamento,
  IEditarLancamento,
  IFiltroLancamentos,
  ILancamento,
  IRespostaCriarLancamento,
} from "../tipos";

class LancamentosService {
  private httpClient = new HttpClient();
  private path = "/lancamentos";

  async listar(filtro: IFiltroLancamentos = {}): Promise<ILancamento[]> {
    const params = new URLSearchParams();
    Object.entries(filtro).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== "") params.set(chave, String(valor));
    });
    const qs = params.toString();
    return await this.httpClient.get<ILancamento[]>(`${this.path}${qs ? `?${qs}` : ""}`);
  }

  async criar(data: ICriarLancamento): Promise<IRespostaCriarLancamento> {
    return await this.httpClient.post<IRespostaCriarLancamento>(this.path, data);
  }

  async editar(id: string, data: IEditarLancamento): Promise<ILancamento> {
    return await this.httpClient.put<ILancamento>(`${this.path}/${id}`, data);
  }

  async excluir(id: string, parcelasFuturas = false): Promise<void> {
    await this.httpClient.delete(`${this.path}/${id}${parcelasFuturas ? "?parcelasFuturas=true" : ""}`);
  }

  async revisar(id: string): Promise<ILancamento> {
    return await this.httpClient.post<ILancamento>(`${this.path}/${id}/revisar`);
  }
}

export default new LancamentosService();
