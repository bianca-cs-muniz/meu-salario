import { Router } from "express";
import Controller from "./autenticacao.controller";
import Validator from "./autenticacao.validator";
import AuthMiddleware from "@middlewares/auth";
import GerarRecorrencias from "@middlewares/gerar-recorrencias";

const routes = Router();
routes.post("/registrar", Validator.registrar, Controller.registrar);
routes.post("/login", Validator.login, Controller.login);
routes
  .route("/perfil")
  .all(AuthMiddleware.authentication, GerarRecorrencias.gerar)
  .get(Controller.perfil)
  .put(Validator.perfil, Controller.atualizarPerfil);
export default routes;
