import { Router } from "express";
import Controller from "./categorias.controller";
import Validator from "./categorias.validator";

const routes = Router();
routes.route("/").get(Validator.read, Controller.read).post(Validator.create, Controller.create);
routes.put("/:id", Validator.pathParams, Validator.update, Controller.update);
export default routes;
