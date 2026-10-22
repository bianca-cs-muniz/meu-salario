import { httpClient } from '@services/httpClient';
import type { IStatusTelegram, IVinculoTelegram } from '@services/tipos';

class TelegramService {
  httpClient;
  path: string;

  constructor() {
    this.httpClient = httpClient;
    this.path = '/telegram/vinculo';
  }

  async statusTelegram(): Promise<IStatusTelegram> {
    const { data } = await this.httpClient.get<IStatusTelegram>(this.path);
    return data;
  }

  /** Gera o link de conexão (vale por 10 minutos). */
  async conectarTelegram(): Promise<IVinculoTelegram> {
    const { data } = await this.httpClient.post<IVinculoTelegram>(this.path);
    return data;
  }

  async desconectarTelegram(): Promise<void> {
    await this.httpClient.delete(this.path);
  }
}

export default new TelegramService();
