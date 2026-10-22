import appConfig from "@config/app.config";

// Cliente mínimo da Bot API do Telegram com fetch nativo.
// NUNCA logar a URL nem o objeto da requisição: a URL contém o token do bot.

const LIMITE_TEXTO = 4000; // o Telegram aceita até 4096 caracteres

/** Erro da Bot API: só status e description (seguros para log). status 0 = sem resposta (rede/timeout). */
export class TelegramErro extends Error {
  constructor(
    public readonly status: number,
    public readonly descricao: string,
  ) {
    super(`Telegram ${status}: ${descricao}`);
    this.name = "TelegramErro";
  }
}

class TelegramCliente {
  private async chamar(metodo: string, corpo: Record<string, unknown>): Promise<unknown> {
    const token = appConfig.telegram.token;
    if (!token) throw new TelegramErro(0, "token ausente");
    let resposta: Response;
    try {
      resposta = await fetch(`https://api.telegram.org/bot${token}/${metodo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (erro) {
      // Só o nome do erro (TimeoutError, TypeError...): a mensagem/causa pode trazer a URL.
      throw new TelegramErro(0, erro instanceof Error ? erro.name : "falha de rede");
    }
    const json = (await resposta.json().catch(() => null)) as { ok?: boolean; result?: unknown; description?: string } | null;
    if (!resposta.ok || !json?.ok) throw new TelegramErro(resposta.status, json?.description ?? "sem descrição");
    return json.result;
  }

  /** Texto puro (sem parse_mode): nada do que o usuário ou o modelo escreve vira formatação. */
  async enviarMensagem(chatId: string, texto: string) {
    await this.chamar("sendMessage", {
      chat_id: chatId,
      text: texto.length > LIMITE_TEXTO ? `${texto.slice(0, LIMITE_TEXTO - 1)}…` : texto,
      link_preview_options: { is_disabled: true },
    });
  }

  async digitando(chatId: string) {
    await this.chamar("sendChatAction", { chat_id: chatId, action: "typing" });
  }
}

export default new TelegramCliente();
