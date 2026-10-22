import { Router } from "express";
import AuthMiddleware from "@middlewares/auth";
import GerarRecorrencias from "@middlewares/gerar-recorrencias";
import autenticacao from "./autenticacao/autenticacao.routes";
import carteiras from "./carteiras/carteiras.routes";
import categorias from "./categorias/categorias.routes";
import cartoes from "./cartoes/cartoes.routes";
import faturas from "./faturas/faturas.routes";
import gastosFixos from "./gastos-fixos/gastos-fixos.routes";
import lancamentos from "./lancamentos/lancamentos.routes";
import resumo from "./resumo/resumo.routes";
import telegram from "./telegram/telegram.routes";

// Rotas privadas: JWT obrigatório e, antes de tudo, gera os gastos fixos que faltam.
const privada = [AuthMiddleware.authentication, GerarRecorrencias.gerar];

const routes = Router();
routes.get("/saude", (_req, res) => res.json({ ok: true }));
routes.use("/autenticacao", autenticacao);
// Webhook público (segredo no header) + vínculo com JWT dentro do próprio router.
routes.use("/telegram", telegram);
routes.use("/carteiras", ...privada, carteiras);
routes.use("/categorias", ...privada, categorias);
routes.use("/cartoes", ...privada, cartoes);
routes.use("/faturas", ...privada, faturas);
routes.use("/gastos-fixos", ...privada, gastosFixos);
routes.use("/lancamentos", ...privada, lancamentos);
routes.use("/resumo", ...privada, resumo);
export default routes;
