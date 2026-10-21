import { RequestHandler } from "express";
import BaseValidator from "@abstracts/validator.abstract";
import { CreateCategoriaSchema } from "./dtos/create.dto";
import { UpdateCategoriaSchema } from "./dtos/update.dto";
import { ReadCategoriaSchema } from "./dtos/read.dto";

class CategoriasValidator extends BaseValidator {
  read: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "query", ReadCategoriaSchema);
  create: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "body", CreateCategoriaSchema);
  update: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "body", UpdateCategoriaSchema);
}

export default new CategoriasValidator();
