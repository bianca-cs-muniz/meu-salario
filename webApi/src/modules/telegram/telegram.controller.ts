import { Request, Response } from "express";
import Service from "./telegram.service";
import { TryCatch } from "@decorators/try-catch.decorator";
import { UpdateTelegramDto } from "./dtos/update.dto";

class TelegramController {
  /** Responde 200 na hora; o processamento roda em seguida (setImmediate). */
  @TryCatch()
  async webhook(req: Request, res: Response) {
    res.status(200).json({ ok: true });
    Service.agendar(req.body as UpdateTelegramDto);
  }

  @TryCatch()
  async gerarVinculo(req: Request, res: Response) {
    res.status(201).json(await Service.gerarVinculo(req.auth.id));
  }

  @TryCatch()
  async status(req: Request, res: Response) {
    res.status(200).json(await Service.status(req.auth.id));
  }

  @TryCatch()
  async desconectar(req: Request, res: Response) {
    await Service.desconectar(req.auth.id);
    res.status(204).send();
  }
}

export default new TelegramController();
