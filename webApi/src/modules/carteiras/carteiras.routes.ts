import { Router } from "express";
import Controller from "./carteiras.controller";
import Validator from "./carteiras.validator";

const routes = Router();
routes.route("/").get(Controller.read).post(Validator.create, Controller.create);
routes.put("/:id", Validator.pathParams, Validator.update, Controller.update);
export default routes;
