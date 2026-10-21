import { Router } from "express";
import Controller from "./gastos-fixos.controller";
import Validator from "./gastos-fixos.validator";

const routes = Router();
routes.route("/").get(Validator.read, Controller.read).post(Validator.create, Controller.create);
routes
  .route("/:id")
  .put(Validator.pathParams, Validator.update, Controller.update)
  .delete(Validator.pathParams, Controller.delete);
export default routes;
