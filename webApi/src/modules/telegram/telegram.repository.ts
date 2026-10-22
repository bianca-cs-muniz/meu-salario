import { PapelMensagem, Prisma } from "@prisma/client";
import DataSource from "@database/data-source";

/** Lançado dentro da transação do vínculo para desfazer tudo quando o código já foi usado. */
class CodigoJaUsado extends Error {}

const semVinculo = { telegramChatId: null, telegramUsername: null, telegramConectadoEm: null } satisfies Prisma.UsuarioUpdateManyMutationInput;

class TelegramRepository {
  private repository = DataSource.usuario;

  /** Usuário ligado ao chat (só id e nome: nada de e-mail ou senha). */
  readPorChat(chatId: string) {
    return this.repository.findUnique({ where: { telegramChatId: chatId }, select: { id: true, nome: true } });
  }

  readVinculo(usuarioId: string) {
    return this.repository.findUnique({
      where: { id: usuarioId },
      select: { telegramChatId: true, telegramUsername: true, telegramConectadoEm: true },
    });
  }

  /** Grava o hash do novo código (substitui o anterior). */
  salvarCodigo(usuarioId: string, codigoHash: string, expiraEm: Date) {
    return this.repository.update({ where: { id: usuarioId }, data: { telegramCodigoHash: codigoHash, telegramCodigoExpiraEm: expiraEm }, select: { id: true } });
  }

  /**
   * Usa o código (uma vez só) e liga o chat à conta dona dele. Se o chat estava ligado a outra conta,
   * desliga a anterior na mesma transação. O update final é condicional (hash igual e não vencido):
   * dois /start simultâneos com o mesmo código → só um atualiza; o outro desfaz a transação.
   * Devolve o nome do usuário e `trocouConta` (o chat estava ligado a outra conta) ou null
   * (código inválido, vencido ou já usado).
   */
  async vincular(codigoHash: string, chatId: string, username: string | null, agora = new Date()): Promise<{ nome: string; trocouConta: boolean } | null> {
    const valido = { telegramCodigoHash: codigoHash, telegramCodigoExpiraEm: { gt: agora } } satisfies Prisma.UsuarioWhereInput;
    try {
      return await DataSource.$transaction(async (tx) => {
        const alvo = await tx.usuario.findFirst({ where: valido, select: { id: true, nome: true } });
        if (!alvo) return null;
        const anterior = await tx.usuario.updateMany({ where: { telegramChatId: chatId, id: { not: alvo.id } }, data: semVinculo });
        const { count } = await tx.usuario.updateMany({
          where: { id: alvo.id, ...valido },
          data: { telegramChatId: chatId, telegramUsername: username, telegramConectadoEm: agora, telegramCodigoHash: null, telegramCodigoExpiraEm: null },
        });
        if (count !== 1) throw new CodigoJaUsado();
        return { nome: alvo.nome, trocouConta: anterior.count > 0 };
      });
    } catch (erro) {
      if (erro instanceof CodigoJaUsado) return null;
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") return null;
      throw erro;
    }
  }

  /** Desliga a conta do Telegram e invalida código pendente (leitura + atualização na mesma transação). Devolve o chat que estava ligado. */
  desvincularUsuario(usuarioId: string): Promise<string | null> {
    return DataSource.$transaction(async (tx) => {
      const anterior = await tx.usuario.findUnique({ where: { id: usuarioId }, select: { telegramChatId: true } });
      await tx.usuario.update({ where: { id: usuarioId }, data: { ...semVinculo, telegramCodigoHash: null, telegramCodigoExpiraEm: null }, select: { id: true } });
      return anterior?.telegramChatId ?? null;
    });
  }

  desvincularChat(chatId: string) {
    return this.repository.updateMany({ where: { telegramChatId: chatId }, data: semVinculo });
  }

  /** Mensagem do histórico. Com `idExterno`, o único (canal, idExterno) barra o reenvio do mesmo update (P2002). */
  registrarMensagem(dados: { usuarioId: string; papel: PapelMensagem; texto: string; idExterno?: string }) {
    return DataSource.mensagemAgente.create({
      data: { usuarioId: dados.usuarioId, papel: dados.papel, texto: dados.texto, canal: "TELEGRAM", idExterno: dados.idExterno ?? null },
      select: { id: true },
    });
  }

  /** O que o estagiário precisa saber do usuário: categorias e cartões ativos e se tem carteira VR. */
  async readContexto(usuarioId: string) {
    const [categorias, cartoes, vr] = await Promise.all([
      DataSource.categoria.findMany({ where: { usuarioId, ativa: true }, select: { id: true, nome: true, aceitaVr: true }, orderBy: { nome: "asc" } }),
      DataSource.cartao.findMany({ where: { usuarioId, ativo: true }, select: { id: true, nome: true }, orderBy: { criadoEm: "asc" } }),
      DataSource.carteira.findFirst({ where: { usuarioId, tipo: "VR", ativa: true }, select: { id: true } }),
    ]);
    return { categorias, cartoes, temCarteiraVr: !!vr };
  }
}

export default new TelegramRepository();
