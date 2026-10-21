import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import AppException from "@erros/app-exception";
import ErrorMessages from "@erros/error-messages";

export function TryCatch() {
  return (_target: object, _key: string, descriptor: PropertyDescriptor) => {
    const metodoOriginal = descriptor.value;
    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        await metodoOriginal.call(this, req, res, next);
      } catch (erro: unknown) {
        if (erro instanceof AppException && erro.status >= 400 && erro.status < 500) return next(erro);
        // Violação de único (corrida entre duas requisições com o mesmo e-mail, nome, telefone...).
        if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") return next(new AppException(409, ErrorMessages.REGISTRO_DUPLICADO));
        console.error("Erro interno ao processar requisição:", erro);
        next(new AppException(500, ErrorMessages.ERRO_INTERNO));
      }
    };
    return descriptor;
  };
}
