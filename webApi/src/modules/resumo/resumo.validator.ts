import { RequestHandler } from "express";
import BaseValidator from "@abstracts/validator.abstract";
import { ReadEvolucaoSchema, ReadResumoSchema } from "./dtos/read.dto";

class ResumoValidator extends BaseValidator {
  read: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "query", ReadResumoSchema);
  evolucao: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "query", ReadEvolucaoSchema);
}

export default new ResumoValidator();
