import { RequestHandler } from "express";
import BaseValidator from "@abstracts/validator.abstract";
import { CreateLancamentoSchema } from "./dtos/create.dto";
import { UpdateLancamentoSchema } from "./dtos/update.dto";
import { DeleteLancamentoSchema, ReadLancamentoSchema } from "./dtos/read.dto";

class LancamentosValidator extends BaseValidator {
  read: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "query", ReadLancamentoSchema);
  create: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "body", CreateLancamentoSchema);
  update: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "body", UpdateLancamentoSchema);
  delete: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "query", DeleteLancamentoSchema);
}

export default new LancamentosValidator();
