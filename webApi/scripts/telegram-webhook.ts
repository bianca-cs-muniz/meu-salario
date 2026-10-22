// Registra o webhook do bot no Telegram e os comandos do menu.
// Uso: npm run telegram:webhook  (lê TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET e URL_API_PUBLICA do ambiente/.env)
// Nunca imprime o token: só o resultado de cada chamada.
import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const segredo = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
const urlApi = process.env.URL_API_PUBLICA?.trim().replace(/\/+$/, "");

function falhar(mensagem: string): never {
  console.error(`Erro: ${mensagem}`);
  process.exit(1);
}

if (!token) falhar("defina TELEGRAM_BOT_TOKEN.");
if (!segredo || !/^[A-Za-z0-9_-]{1,256}$/.test(segredo)) falhar("defina TELEGRAM_WEBHOOK_SECRET com 1 a 256 caracteres A-Z, a-z, 0-9, _ ou -.");
if (!urlApi || !/^https:\/\//.test(urlApi)) falhar("defina URL_API_PUBLICA com https:// (ex.: https://meu-salario-api.onrender.com).");

async function chamar(metodo: string, corpo?: Record<string, unknown>) {
  let resposta: Response;
  try {
    resposta = await fetch(`https://api.telegram.org/bot${token}/${metodo}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo ?? {}),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (erro) {
    // Só o nome do erro: a mensagem pode conter a URL (com o token).
    falhar(`${metodo}: sem resposta do Telegram (${erro instanceof Error ? erro.name : "falha de rede"}).`);
  }
  const json = (await resposta.json().catch(() => null)) as { ok?: boolean; result?: unknown; description?: string } | null;
  if (!json?.ok) falhar(`${metodo}: ${resposta.status} ${json?.description ?? "sem descrição"}`);
  return json.result;
}

async function main() {
  const urlWebhook = `${urlApi}/api/telegram/webhook`;
  await chamar("setWebhook", { url: urlWebhook, secret_token: segredo, allowed_updates: ["message"], drop_pending_updates: true });
  console.log(`setWebhook ok: ${urlWebhook}`);

  await chamar("setMyCommands", {
    commands: [
      { command: "start", description: "Conectar com o app" },
      { command: "sobra", description: "Quanto sobrou no mês" },
      { command: "fatura", description: "Fatura de um cartão: /fatura nubank" },
      { command: "gasto", description: "Gasto de uma categoria: /gasto mercado" },
      { command: "apagar", description: "Desfaz o último anotado pelo Telegram" },
      { command: "ajuda", description: "Exemplos do que eu entendo" },
      { command: "desconectar", description: "Desligar este chat da sua conta" },
    ],
  });
  console.log("setMyCommands ok: start, sobra, fatura, gasto, apagar, ajuda, desconectar");

  const info = (await chamar("getWebhookInfo")) as Record<string, unknown>;
  console.log("getWebhookInfo:", {
    url: info.url,
    pending_update_count: info.pending_update_count,
    allowed_updates: info.allowed_updates,
    last_error_date: info.last_error_date ?? null,
    last_error_message: info.last_error_message ?? null,
  });
}

main();
