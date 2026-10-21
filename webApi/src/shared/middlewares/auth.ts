import { Request, Response, NextFunction } from "express";
import TokenHelper from "@helpers/token.helper";
import AppException from "@erros/app-exception";
import ErrorMessages from "@erros/error-messages";
class AuthMiddleware { authentication(req: Request, _res: Response, next: NextFunction) { const header=req.headers.authorization; if(!header?.startsWith("Bearer ")) return next(new AppException(401,ErrorMessages.TOKEN_AUSENTE)); try { req.auth=TokenHelper.verificarToken(header.slice(7)); next(); } catch { next(new AppException(401,ErrorMessages.TOKEN_INVALIDO)); } } }
export default new AuthMiddleware();
