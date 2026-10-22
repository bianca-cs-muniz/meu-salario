import appConfig from "@config/app.config";
import Repository from "./telegram.repository";
import TelegramCliente, { TelegramErro } from "./telegram.cliente";
import { expiracaoDoCodigo, gerarCodigo, hashCodigo } from "./telegram.seguranca";
import { UpdateTelegramDto } from "./dtos/update.dto";
import AgenteService from "./agente/agente.service";
import Respostas from "./agente/agente.respostas";

/** Nome do erro e status (Telegram/HTTP) quando houver: nunca a mensagem, que pode ter texto ou valores. */
function resumoDoErro(erro: unknown) {
  if (erro instanceof TelegramErro) return { erro: erro.name, status: erro.status };
  const comCodigo = erro as { name?: string; code?: string; status?: number };
  return { erro: comCodigo?.name ?? "desconhecido", codigo: comCodigo?.code, status: comCodigo?.status };
}

class TelegramService {
  /** POST /telegram/vinculo — novo código de uso único (substitui o anterior), válido por 10 minutos. */
  async gerarVinculo(usuarioId: string) {
    const codigo = gerarCodigo();
    const expiraEm = expiracaoDoCodigo();
    await Repository.salvarCodigo(usuarioId, hashCodigo(codigo), expiraEm);
    return { link: `https://t.me/${appConfig.telegram.botUsername}?start=${codigo}`, expiraEm: expiraEm.toISOString() };
  }

  /** GET /telegram/vinculo — situação do vínculo (sem chatId nem código). */
  async status(usuarioId: string) {
    const vinculo = await Repository.readVinculo(usuarioId);
    const conectado = !!vinculo?.telegramChatId;
    return {
      disponivel: appConfig.telegram.habilitado,
      conectado,
      usuario: conectado ? vinculo?.telegramUsername ?? null : null,
      conectadoEm: conectado ? vinculo?.telegramConectadoEm?.toISOString() ?? null : null,
    };
  }

  /** DELETE /telegram/vinculo — desliga o chat e dispara o aviso no Telegram sem esperar (falha no aviso só loga). */
  async desconectar(usuarioId: string) {
    const chatId = await Repository.desvincularUsuario(usuarioId);
    if (!chatId) return;
    void TelegramCliente.enviarMensagem(chatId, Respostas.DESCONECTADO).catch((erro: unknown) =>
      console.error("[telegram] falha ao avisar desconexão", resumoDoErro(erro)),
    );
  }

  /** Fila por chat: o update seguinte de um chat só começa quando o anterior terminar. */
  private filas = new Map<string, Promise<unknown>>();

  /**
   * Webhook: o controller já respondeu 200; o processamento roda depois e só loga (sem texto nem valores).
   * Updates do mesmo chat rodam em ordem (um "apaga" não passa na frente de um lançamento ainda no Claude);
   * chats diferentes rodam em paralelo. Update sem chat identificável roda solto.
   */
  agendar(update: UpdateTelegramDto) {
    const chat = update.message?.chat?.id;
    if (chat === undefined || chat === null) {
      setImmediate(() => void this.processar(update));
      return;
    }
    const chave = String(chat);
    // Sem fila: espera um setImmediate para manter o "responde 200 primeiro, processa depois".
    const anterior = this.filas.get(chave) ?? new Promise<void>((resolve) => setImmediate(resolve));
    const promessa: Promise<unknown> = anterior
      .then(() => this.processar(update))
      .catch((erro: unknown) => console.error("[telegram] falha na fila do chat", { update_id: update.update_id, ...resumoDoErro(erro) }))
      .finally(() => {
        // Só remove se ninguém entrou na fila depois (senão apagaria a promessa do update seguinte).
        if (this.filas.get(chave) === promessa) this.filas.delete(chave);
      });
    this.filas.set(chave, promessa);
  }

  /** Processa um update e loga o resultado; nunca rejeita. */
  private async processar(update: UpdateTelegramDto) {
    const inicio = Date.now();
    try {
      const { intencao, caminho } = await AgenteService.processar(update);
      console.info("[telegram] update processado", { update_id: update.update_id, intencao, caminho: caminho ?? null, duracaoMs: Date.now() - inicio });
    } catch (erro) {
      console.error("[telegram] falha ao processar update", { update_id: update.update_id, duracaoMs: Date.now() - inicio, ...resumoDoErro(erro) });
    }
  }
}

export default new TelegramService();
