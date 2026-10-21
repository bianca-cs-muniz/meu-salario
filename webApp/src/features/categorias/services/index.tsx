import { httpClient } from '@services/httpClient';
import type { GrupoCategoria, ICategoria } from '@services/tipos';

export interface ISalvarCategoria {
  nome: string;
  icone: string;
  cor: string;
  grupo: GrupoCategoria;
  limiteMensalCentavos: number | null;
  aceitaVr: boolean;
  ativa?: boolean;
}

class CategoriasService {
  httpClient;
  path: string;

  constructor() {
    this.httpClient = httpClient;
    this.path = '/categorias';
  }

  async listar(competencia?: string): Promise<ICategoria[]> {
    const qs = competencia ? `?competencia=${competencia}` : '';
    const { data } = await this.httpClient.get<ICategoria[]>(`${this.path}${qs}`);
    return data;
  }

  async criar(dto: ISalvarCategoria): Promise<ICategoria> {
    const { data } = await this.httpClient.post<ICategoria>(this.path, dto);
    return data;
  }

  async editar(id: string, dto: Partial<ISalvarCategoria>): Promise<ICategoria> {
    const { data } = await this.httpClient.put<ICategoria>(`${this.path}/${id}`, dto);
    return data;
  }
}

export default new CategoriasService();
