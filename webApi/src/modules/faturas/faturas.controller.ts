import { Request, Response } from "express";
import Service from "./faturas.service";
import { TryCatch } from "@decorators/try-catch.decorator";
import { ReadFaturaDto } from "./dtos/read.dto";

class FaturasController {
  @TryCatch()
  async read(req: Request, res: Response) {
    res.status(200).json(await Service.read(req.auth.id, req.query as unknown as ReadFaturaDto));
  }

  @TryCatch()
  async readByCartao(req: Request, res: Response) {
    res.status(200).json(await Service.readByCartao(req.auth.id, req.params.id));
  }

  @TryCatch()
  async pagar(req: Request, res: Response) {
    res.status(200).json(await Service.pagar(req.auth.id, req.params.id));
  }

  @TryCatch()
  async desfazerPagamento(req: Request, res: Response) {
    res.status(200).json(await Service.desfazerPagamento(req.auth.id, req.params.id));
  }
}

export default new FaturasController();
