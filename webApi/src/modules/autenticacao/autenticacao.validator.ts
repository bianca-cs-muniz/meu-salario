import { Request, Response, NextFunction } from "express";
import { RegistrarSchema } from "./dtos/registrar.dto";
import { LoginSchema } from "./dtos/login.dto";
import { PerfilSchema } from "./dtos/perfil.dto";
import AppException from "@erros/app-exception";

class Validator {
  registrar(req: Request, _res: Response, next: NextFunction) {
    const r = RegistrarSchema.safeParse(req.body);
    if (!r.success) return next(new AppException(400, r.error.issues.map((i) => i.message).join(" | ")));
    req.body = r.data;
    next();
  }

  login(req: Request, _res: Response, next: NextFunction) {
    const r = LoginSchema.safeParse(req.body);
    if (!r.success) return next(new AppException(400, r.error.issues.map((i) => i.message).join(" | ")));
    req.body = r.data;
    next();
  }

  perfil(req: Request, _res: Response, next: NextFunction) {
    const r = PerfilSchema.safeParse(req.body);
    if (!r.success) return next(new AppException(400, r.error.issues.map((i) => i.message).join(" | ")));
    req.body = r.data;
    next();
  }
}

export default new Validator();
