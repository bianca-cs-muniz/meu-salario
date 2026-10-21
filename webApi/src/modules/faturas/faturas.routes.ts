import { Router } from "express";
import Controller from "./faturas.controller";
import Validator from "./faturas.validator";

const routes = Router();
routes.get("/", Validator.read, Controller.read);
routes.get("/cartao/:id", Validator.pathParams, Controller.readByCartao);
routes.post("/:id/pagar", Validator.pathParams, Controller.pagar);
routes.post("/:id/desfazer-pagamento", Validator.pathParams, Controller.desfazerPagamento);
export default routes;
