import jwt from "jsonwebtoken";
import appConfig from "@config/app.config";
import { IPayloadDto } from "@modulos/autenticacao/dtos/payload.dto";
class TokenHelper { criarToken(payload: IPayloadDto): string { return jwt.sign(payload, appConfig.jwtSecret, { expiresIn: appConfig.jwtExpiresIn } as jwt.SignOptions); } verificarToken(token: string): IPayloadDto { return jwt.verify(token, appConfig.jwtSecret) as IPayloadDto; } }
export default new TokenHelper();
