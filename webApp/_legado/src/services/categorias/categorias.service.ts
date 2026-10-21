import HttpClient from "../HttpClient";
import { ICategoria, GrupoCategoria } from "../tipos";

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
  private httpClient = new HttpClient();
  private path = "/categorias";

  async listar(competencia?: string): Promise<ICategoria[]> {
    const qs = competencia ? `?competencia=${competencia}` : "";
    return await this.httpClient.get<ICategoria[]>(`${this.path}${qs}`);
  }

  async criar(data: ISalvarCategoria): Promise<ICategoria> {
    return await this.httpClient.post<ICategoria>(this.path, data);
  }

  async editar(id: string, data: Partial<ISalvarCategoria>): Promise<ICategoria> {
    return await this.httpClient.put<ICategoria>(`${this.path}/${id}`, data);
  }
}

export default new CategoriasService();
