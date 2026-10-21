import bcrypt from "bcryptjs";
class SenhaHelper { gerarHash(senha: string): string { return bcrypt.hashSync(senha, 10); } compararComHash(senha: string, hash: string): boolean { return bcrypt.compareSync(senha, hash); } }
export default new SenhaHelper();
