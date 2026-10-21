import { RequestHandler } from "express";
import BaseValidator from "@abstracts/validator.abstract";
import { CreateCartaoSchema } from "./dtos/create.dto";
import { UpdateCartaoSchema } from "./dtos/update.dto";

class CartoesValidator extends BaseValidator {
  create: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "body", CreateCartaoSchema);
  update: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "body", UpdateCartaoSchema);
}

export default new CartoesValidator();
