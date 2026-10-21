import { Request, Response, NextFunction } from "express";
import GastosFixosService from "@modulos/gastos-fixos/gastos-fixos.service";

// Roda depois do AuthMiddleware: gera os lançamentos dos gastos fixos que ainda faltam
// (até o mês que vem) antes de qualquer leitura. Se falhar, registra e segue a requisição.
class GerarRecorrenciasMiddleware {
  async gerar(req: Request, _res: Response, next: NextFunction) {
    try {
      await GastosFixosService.gerarPendentes(req.auth.id);
    } catch (erro) {
      console.error("Falha ao gerar gastos fixos:", erro);
    }
    next();
  }
}

export default new GerarRecorrenciasMiddleware();
