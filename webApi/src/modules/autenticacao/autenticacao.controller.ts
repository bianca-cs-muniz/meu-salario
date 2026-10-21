import { Request, Response } from "express";
import Service from "./autenticacao.service";
import { TryCatch } from "@decorators/try-catch.decorator";

class Controller {
  @TryCatch()
  async registrar(req: Request, res: Response) {
    res.status(201).json(await Service.registrar(req.body));
  }

  @TryCatch()
  async login(req: Request, res: Response) {
    res.status(200).json(await Service.login(req.body));
  }

  @TryCatch()
  async perfil(req: Request, res: Response) {
    res.status(200).json(await Service.perfil(req.auth.id));
  }

  @TryCatch()
  async atualizarPerfil(req: Request, res: Response) {
    res.status(200).json(await Service.atualizarPerfil(req.auth.id, req.body));
  }
}

export default new Controller();
