import { httpClient } from '@services/httpClient';
import type {
  ICriarLancamento,
  IEditarLancamento,
  IFiltroLancamentos,
  ILancamento,
  IRespostaCriarLancamento,
} from '@services/tipos';

class LancamentosService {
  httpClient;
  path: string;

  constructor() {
    this.httpClient = httpClient;
    this.path = '/lancamentos';
  }

  async listar(filtro: IFiltroLancamentos = {}): Promise<ILancamento[]> {
    const params = new URLSearchParams();
    Object.entries(filtro).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== '') params.set(chave, String(valor));
    });
    const qs = params.toString();
    const { data } = await this.httpClient.get<ILancamento[]>(`${this.path}${qs ? `?${qs}` : ''}`);
    return data;
  }

  async criar(dto: ICriarLancamento): Promise<IRespostaCriarLancamento> {
    const { data } = await this.httpClient.post<IRespostaCriarLancamento>(this.path, dto);
    return data;
  }

  async editar(id: string, dto: IEditarLancamento): Promise<ILancamento> {
    const { data } = await this.httpClient.put<ILancamento>(`${this.path}/${id}`, dto);
    return data;
  }

  async excluir(id: string, parcelasFuturas = false): Promise<void> {
    await this.httpClient.delete(`${this.path}/${id}${parcelasFuturas ? '?parcelasFuturas=true' : ''}`);
  }

  async revisar(id: string): Promise<ILancamento> {
    const { data } = await this.httpClient.post<ILancamento>(`${this.path}/${id}/revisar`);
    return data;
  }
}

export default new LancamentosService();
