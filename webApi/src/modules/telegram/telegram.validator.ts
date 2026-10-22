import { RequestHandler } from "express";
import BaseValidator from "@abstracts/validator.abstract";
import appConfig from "@config/app.config";
import ErrorMessages from "@erros/error-messages";
import { segredoConfere } from "./telegram.seguranca";
import { UpdateTelegramSchema } from "./dtos/update.dto";

// 503 é respondido aqui mesmo: o tratador de erros da API só repassa AppException 4xx.
class TelegramValidator extends BaseValidator {
  /** Sem TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET e TELEGRAM_BOT_USERNAME → 503. */
  habilitado: RequestHandler = (_req, res, next) => {
    if (!appConfig.telegram.habilitado) return void res.status(503).json({ error: ErrorMessages.TELEGRAM_NAO_CONFIGURADO });
    next();
  };

  /** Header X-Telegram-Bot-Api-Secret-Token igual ao TELEGRAM_WEBHOOK_SECRET (tempo constante) → senão 401. */
  segredo: RequestHandler = (req, res, next) => {
    if (!segredoConfere(req.get("X-Telegram-Bot-Api-Secret-Token"), appConfig.telegram.webhookSecret))
      return void res.status(401).json({ error: ErrorMessages.TELEGRAM_SEGREDO_INVALIDO });
    next();
  };

  /** Update fora do formato esperado é ignorado com 200 (senão o Telegram fica reenviando). */
  update: RequestHandler = (req, res, next) => {
    const resultado = UpdateTelegramSchema.safeParse(req.body);
    if (!resultado.success) return void res.status(200).json({ ok: true });
    req.body = resultado.data;
    next();
  };
}

export default new TelegramValidator();
