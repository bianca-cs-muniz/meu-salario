import { IPayloadDto } from "../../modules/autenticacao/dtos/payload.dto";
declare global { namespace Express { interface Request { auth: IPayloadDto } } }
export {};
