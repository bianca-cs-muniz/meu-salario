import { Request, Response } from "express";
import Service from "./carteiras.service";
import { TryCatch } from "@decorators/try-catch.decorator";

class CarteirasController {
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
}

export default new CarteirasController();
