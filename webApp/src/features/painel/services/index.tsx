import { httpClient } from '@services/httpClient';
import type { IEvolucaoMes, IRecorrencia, IResumo, ISalvarRecorrencia } from '@services/tipos';

class PainelService {
  httpClient;
  path: string;
  pathGastosFixos: string;

  constructor() {
    this.httpClient = httpClient;
    this.path = '/resumo';
    this.pathGastosFixos = '/gastos-fixos';
  }

  /** Resumo do mês ("AAAA-MM"). */
  async buscarResumo(competencia: string): Promise<IResumo> {
    const { data } = await this.httpClient.get<IResumo>(`${this.path}?competencia=${competencia}`);
    return data;
  }

  /** Entradas, saídas e sobra dos últimos `meses` meses. */
  async buscarEvolucao(meses = 6): Promise<IEvolucaoMes[]> {
    const { data } = await this.httpClient.get<IEvolucaoMes[]>(`${this.path}/evolucao?meses=${meses}`);
    return data;
  }

  /** Usado pelo Onboarding para cadastrar o salário e o crédito do VR como entradas fixas. */
  async criarGastoFixo(dto: ISalvarRecorrencia): Promise<IRecorrencia> {
    const { data } = await this.httpClient.post<IRecorrencia>(this.pathGastosFixos, dto);
    return data;
  }
}

export default new PainelService();
