import { Router } from "express";
import AuthMiddleware from "@middlewares/auth";
import Controller from "./telegram.controller";
import Validator from "./telegram.validator";

const routes = Router();

// Público: chamado pelo Telegram. Sem configuração → 503; segredo errado → 401.
routes.post("/webhook", Validator.habilitado, Validator.segredo, Validator.update, Controller.webhook);

// Vínculo da conta (JWT). O GET responde mesmo sem configuração ({ disponivel: false }).
routes
  .route("/vinculo")
  .all(AuthMiddleware.authentication)
  .get(Controller.status)
  .post(Validator.habilitado, Controller.gerarVinculo)
  .delete(Validator.habilitado, Controller.desconectar);

export default routes;
