import { Router } from "express";
import Controller from "./lancamentos.controller";
import Validator from "./lancamentos.validator";

const routes = Router();
routes.route("/").get(Validator.read, Controller.read).post(Validator.create, Controller.create);
routes.post("/:id/revisar", Validator.pathParams, Controller.revisar);
routes
  .route("/:id")
  .put(Validator.pathParams, Validator.update, Controller.update)
  .delete(Validator.pathParams, Validator.delete, Controller.delete);
export default routes;
