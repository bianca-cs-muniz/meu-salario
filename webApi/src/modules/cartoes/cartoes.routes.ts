import { Router } from "express";
import Controller from "./cartoes.controller";
import Validator from "./cartoes.validator";

const routes = Router();
routes.route("/").get(Controller.read).post(Validator.create, Controller.create);
routes
  .route("/:id")
  .put(Validator.pathParams, Validator.update, Controller.update)
  .delete(Validator.pathParams, Controller.delete);
export default routes;
