import { RequestHandler } from "express";
import BaseValidator from "@abstracts/validator.abstract";
import { CreateGastoFixoSchema } from "./dtos/create.dto";
import { UpdateGastoFixoSchema } from "./dtos/update.dto";
import { ReadGastoFixoSchema } from "./dtos/read.dto";

class GastosFixosValidator extends BaseValidator {
  read: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "query", ReadGastoFixoSchema);
  create: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "body", CreateGastoFixoSchema);
  update: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "body", UpdateGastoFixoSchema);
}

export default new GastosFixosValidator();
