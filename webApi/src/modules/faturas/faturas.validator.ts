import { RequestHandler } from "express";
import BaseValidator from "@abstracts/validator.abstract";
import { ReadFaturaSchema } from "./dtos/read.dto";

class FaturasValidator extends BaseValidator {
  read: RequestHandler = (req, _res, next) => this.validateSchema(req, next, "query", ReadFaturaSchema);
}

export default new FaturasValidator();
