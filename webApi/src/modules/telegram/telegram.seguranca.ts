// Funções puras de segurança do Telegram (sem banco, sem rede, sem alias: testáveis isoladamente).
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** Validade do código do link de vínculo. */
export const VALIDADE_CODIGO_MS = 10 * 60 * 1000;

/** O parâmetro do /start do Telegram aceita até 64 caracteres A-Z, a-z, 0-9, _ e -. */
export const REGEX_CODIGO = /^[A-Za-z0-9_-]{1,64}$/;

const sha256 = (texto: string) => createHash("sha256").update(texto, "utf8").digest();

/**
 * Compara o header X-Telegram-Bot-Api-Secret-Token com o segredo configurado em tempo constante.
 * Os dois lados passam por sha256 antes do timingSafeEqual (tamanhos sempre iguais).
 */
export function segredoConfere(recebido: unknown, esperado: string | undefined): boolean {
  if (typeof recebido !== "string" || !recebido || !esperado) return false;
  return timingSafeEqual(sha256(recebido), sha256(esperado));
}

/** Código de uso único do link (24 bytes aleatórios → 32 caracteres base64url). */
export function gerarCodigo(): string {
  return randomBytes(24).toString("base64url");
}

/** Só o hash do código é gravado no banco. */
export function hashCodigo(codigo: string): string {
  return createHash("sha256").update(codigo, "utf8").digest("hex");
}

export function expiracaoDoCodigo(agora = new Date()): Date {
  return new Date(agora.getTime() + VALIDADE_CODIGO_MS);
}

export function codigoTemFormatoValido(codigo: string): boolean {
  return REGEX_CODIGO.test(codigo);
}
