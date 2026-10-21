import { RequestHandler } from "express";
import BaseValidator from "@abstracts/validator.abstract";
import { CreateCarteiraSchema } from "./dtos/create.dto";
import { UpdateCarteiraSchema } from "./dtos/update.dto";

class CarteirasValidator extends BaseValidator {
  create: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "body", CreateCarteiraSchema);
  update: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "body", UpdateCarteiraSchema);
}

export default new CarteirasValidator();
