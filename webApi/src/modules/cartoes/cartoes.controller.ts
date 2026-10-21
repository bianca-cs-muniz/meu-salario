import { Request, Response } from "express";
import Service from "./cartoes.service";
import { TryCatch } from "@decorators/try-catch.decorator";

class CartoesController {
  @TryCatch()
  async read(req: Request, res: Response) {
    res.status(200).json(await Service.read(req.auth.id));
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
    await Service.delete(req.auth.id, req.params.id);
    res.status(204).send();
  }
}

export default new CartoesController();
