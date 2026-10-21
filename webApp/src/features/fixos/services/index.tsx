import { httpClient } from '@services/httpClient';
import type { IRecorrencia, ISalvarRecorrencia, TipoLancamento } from '@services/tipos';

class GastosFixosService {
  httpClient;
  path: string;

  constructor() {
    this.httpClient = httpClient;
    this.path = '/gastos-fixos';
  }

  async listar(tipo?: TipoLancamento): Promise<IRecorrencia[]> {
    const qs = tipo ? `?tipo=${tipo}` : '';
    const { data } = await this.httpClient.get<IRecorrencia[]>(`${this.path}${qs}`);
    return data;
  }

  async criar(dto: ISalvarRecorrencia): Promise<IRecorrencia> {
    const { data } = await this.httpClient.post<IRecorrencia>(this.path, dto);
    return data;
  }

  async editar(id: string, dto: Partial<ISalvarRecorrencia>): Promise<IRecorrencia> {
    const { data } = await this.httpClient.put<IRecorrencia>(`${this.path}/${id}`, dto);
    return data;
  }

  /** Encerra a recorrência: some dos meses futuros, fica nos passados. */
  async encerrar(id: string): Promise<void> {
    await this.httpClient.delete(`${this.path}/${id}`);
  }
}

export default new GastosFixosService();
