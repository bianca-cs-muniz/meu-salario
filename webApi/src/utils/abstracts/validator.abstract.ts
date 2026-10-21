import { NextFunction, Request, RequestHandler } from "express";
import { z } from "zod";
import AppException from "@erros/app-exception";
import { RequestPath } from "@dtos/request-path.dto";
import { RequestQuery } from "@dtos/request-query.dto";
import { TipoPropriedadeRequest } from "@tipos/request.type";

// Classe base para os Validators de cada módulo. Cada módulo estende essa
// classe e implementa seus próprios métodos (create, update...) chamando
// `validateSchema` com o schema Zod correspondente.
abstract class BaseValidator {
  constructor(
    protected readonly pathSchema = RequestPath,
    protected readonly querySchema = RequestQuery,
  ) {}

  private validarComZod<T extends z.ZodTypeAny>(schema: T, valor: any) {
    return schema.parse(valor);
  }

  protected validateSchema(req: Request, next: NextFunction, propriedade: TipoPropriedadeRequest, schema: z.ZodTypeAny) {
    try {
      req[propriedade] = this.validarComZod(schema, req[propriedade]);
      next();
    } catch (err: any) {
      const mensagem = err?.issues
        ? err.issues.map((i: any) => `${i.path.join(".")}: ${i.message}`).join(" | ")
        : "Dados inválidos.";
      next(new AppException(400, mensagem));
    }
  }

  public pathParams: RequestHandler = (req, _res, next) => {
    this.validateSchema(req, next, "params", this.pathSchema);
  };

  public queryParams: RequestHandler = (req, _res, next) => {
    this.validateSchema(req, next, "query", this.querySchema);
  };
}

export default BaseValidator;
