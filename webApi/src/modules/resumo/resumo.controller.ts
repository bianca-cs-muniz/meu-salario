import { Request, Response } from "express";
import Service from "./resumo.service";
import { TryCatch } from "@decorators/try-catch.decorator";
import { ReadEvolucaoDto, ReadResumoDto } from "./dtos/read.dto";

class ResumoController {
  @TryCatch()
  async read(req: Request, res: Response) {
    const { competencia } = req.query as unknown as ReadResumoDto;
    res.status(200).json(await Service.read(req.auth.id, competencia));
  }

  @TryCatch()
  async evolucao(req: Request, res: Response) {
    const { meses } = req.query as unknown as ReadEvolucaoDto;
    res.status(200).json(await Service.evolucao(req.auth.id, meses));
  }
}

export default new ResumoController();
