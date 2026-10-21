import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "@modulos/index.routes";
import appConfig from "@config/app.config";
import AppException from "@erros/app-exception";
import ErrorMessages from "@erros/error-messages";

const app = express();
app.use(helmet());
app.use(cors({ origin: appConfig.urlFrontend.split(",").map((valor) => valor.trim()) }));
app.use(express.json());
app.use("/api", routes);

// Rota inexistente.
app.use((_req: Request, res: Response) => res.status(404).json({ error: ErrorMessages.ROTA_NAO_ENCONTRADA }));

// Formato de erro: { error: "mensagem" }.
app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (erro instanceof AppException && erro.status >= 400 && erro.status < 500) return res.status(erro.status).json({ error: erro.message });
  const erroDoCorpo = erro as { type?: string; status?: number };
  if (erroDoCorpo?.type === "entity.parse.failed") return res.status(400).json({ error: ErrorMessages.JSON_INVALIDO });
  if (typeof erroDoCorpo?.status === "number" && erroDoCorpo.status >= 400 && erroDoCorpo.status < 500) return res.status(erroDoCorpo.status).json({ error: ErrorMessages.DADOS_INVALIDOS });
  console.error("Erro interno no servidor:", erro);
  return res.status(500).json({ error: ErrorMessages.ERRO_INTERNO });
});
export default app;
