import { Request, Response } from "express";
import Service from "./lancamentos.service";
import { TryCatch } from "@decorators/try-catch.decorator";
import { DeleteLancamentoDto, ReadLancamentoDto } from "./dtos/read.dto";

class LancamentosController {
  @TryCatch()
  async read(req: Request, res: Response) {
    res.status(200).json(await Service.read(req.auth.id, req.query as unknown as ReadLancamentoDto));
  }

  @TryCatch()
  async create(req: Request, res: Response) {
    res.status(201).json(await Service.create(req.auth.id, req.body));
  }

  @TryCatch()
  async update(req: Request, res: Response) {
    res.status(200).json(await Service.update(req.auth.id, req.params.id, req.body));
  }

  @TryCatch()
  async delete(req: Request, res: Response) {
    const { parcelasFuturas } = req.query as unknown as DeleteLancamentoDto;
    await Service.delete(req.auth.id, req.params.id, parcelasFuturas);
    res.status(204).send();
  }

  @TryCatch()
  async revisar(req: Request, res: Response) {
    res.status(200).json(await Service.revisar(req.auth.id, req.params.id));
  }
}

export default new LancamentosController();
