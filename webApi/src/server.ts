import "dotenv/config"; import app from "./app"; import appConfig from "@config/app.config";
app.listen(appConfig.porta,()=>console.log(`API Meu Salário disponível em http://localhost:${appConfig.porta}/api`));
