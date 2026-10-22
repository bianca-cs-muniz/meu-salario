const ambiente = process.env.NODE_ENV || "development";
const SEGREDO_LOCAL = "segredo-local-meu-salario-nao-usar-em-producao";

/**
 * JWT_SECRET (16+ caracteres) é obrigatório fora de development/test.
 * NODE_ENV ausente só conta como desenvolvimento se o JWT_SECRET (16+) vier do .env;
 * segredo curto ou o fixo de fallback só são aceitos com NODE_ENV=development ou test explícito (com aviso).
 */
function segredoJwt(): string {
  const valor = process.env.JWT_SECRET?.trim();
  if (valor && valor.length >= 16) return valor;
  const devOuTesteExplicito = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
  if (!devOuTesteExplicito) throw new Error("JWT_SECRET precisa estar definido com pelo menos 16 caracteres (obrigatório fora de NODE_ENV=development/test).");
  console.warn(`[aviso] JWT_SECRET ${valor ? "curto (menos de 16 caracteres)" : "ausente: usando o segredo local de desenvolvimento"}. Nunca use isso em produção.`);
  return valor || SEGREDO_LOCAL;
}
/** Valor de variável de ambiente sem espaços; vazio conta como ausente. */
function variavel(nome: string): string | undefined {
  return process.env[nome]?.trim() || undefined;
}

// Telegram (estagiário): opcional. Sem as três variáveis, as rotas /api/telegram respondem 503.
// O bot (webhook e rotas) só depende destas três: funciona sem a chave da Anthropic.
const telegramToken = variavel("TELEGRAM_BOT_TOKEN");
const telegramWebhookSecret = variavel("TELEGRAM_WEBHOOK_SECRET");
const telegramBotUsername = variavel("TELEGRAM_BOT_USERNAME")?.replace(/^@/, "");

// Claude: opcional e independente do Telegram. As mensagens são lidas primeiro por regras (formato fixo);
// `anthropic.habilitado` só liga a reserva para texto livre. Sem chave, texto fora do formato recebe o molde.
const anthropicApiKey = variavel("ANTHROPIC_API_KEY");

export default {
  ambiente,
  ehProducao: ambiente === "production",
  porta: Number(process.env.PORTA || process.env.PORT || 4000),
  jwtSecret: segredoJwt(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  urlFrontend: process.env.URL_FRONTEND || "http://localhost:3000",
  fusoHorario: process.env.TZ || "America/Sao_Paulo",
  telegram: {
    token: telegramToken,
    webhookSecret: telegramWebhookSecret,
    botUsername: telegramBotUsername,
    habilitado: Boolean(telegramToken && telegramWebhookSecret && telegramBotUsername),
  },
  anthropic: {
    apiKey: anthropicApiKey,
    modelo: variavel("ANTHROPIC_MODEL") ?? "claude-haiku-5-5",
    habilitado: Boolean(anthropicApiKey),
  },
};
