import { Router } from "express";
import Controller from "./resumo.controller";
import Validator from "./resumo.validator";

const routes = Router();
routes.get("/evolucao", Validator.evolucao, Controller.evolucao);
routes.get("/", Validator.read, Controller.read);
export default routes;
