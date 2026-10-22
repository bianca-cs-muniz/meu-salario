// Limites em memória (puros, sem banco). Reiniciam junto com a API, o que basta para
// proteger o custo do Claude numa instância única.
// - Por chat: todas as mensagens de chats vinculados (lidas pelas regras ou pelo Claude).
// - Global diário: só as chamadas ao Claude (todos os chats somados).

export type ConfigLimitador = {
  /** Mensagens por chat dentro da janela. */
  porJanela: number;
  janelaMs: number;
  /** Mensagens por chat no dia (America/Sao_Paulo). */
  porDia: number;
  /** Teto global diário de chamadas ao Claude (todos os chats). */
  claudePorDia: number;
};

/** Motivo do bloqueio por chat. */
export type MotivoLimite = "JANELA" | "DIA";
export type ResultadoLimite = { ok: true } | { ok: false; motivo: MotivoLimite; avisar: boolean };

export const LIMITES_PADRAO: ConfigLimitador = { porJanela: 20, janelaMs: 10 * 60 * 1000, porDia: 150, claudePorDia: 1000 };

type EstadoChat = { recentes: number[]; dia: string; noDia: number; avisadoEm: string | null };

const formatoDia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" });

/** "AAAA-MM-DD" do instante em São Paulo. */
export function diaEmSaoPaulo(agoraMs: number): string {
  return formatoDia.format(new Date(agoraMs));
}

export class Limitador {
  private chats = new Map<string, EstadoChat>();
  private claude = { dia: "", total: 0 };

  constructor(private readonly config: ConfigLimitador = LIMITES_PADRAO) {}

  /**
   * Conta uma mensagem do chat (qualquer caminho: regras ou Claude) se couber nos limites do chat.
   * `avisar` é true só no primeiro bloqueio de cada janela/dia, para não responder a cada mensagem.
   */
  permitirChat(chatId: string, agoraMs = Date.now()): ResultadoLimite {
    const dia = diaEmSaoPaulo(agoraMs);
    this.limparDiasAntigos(dia);

    const estado = this.chats.get(chatId) ?? { recentes: [], dia, noDia: 0, avisadoEm: null };
    if (estado.dia !== dia) Object.assign(estado, { dia, noDia: 0, avisadoEm: null });
    estado.recentes = estado.recentes.filter((t) => agoraMs - t < this.config.janelaMs);
    this.chats.set(chatId, estado);

    const motivo: MotivoLimite | null =
      estado.noDia >= this.config.porDia ? "DIA" : estado.recentes.length >= this.config.porJanela ? "JANELA" : null;

    if (motivo) {
      // Chave do aviso: no limite da janela, muda quando a janela "anda" (mensagem mais antiga ainda contada).
      const chaveAviso = motivo === "JANELA" ? `JANELA:${estado.recentes[0]}` : `${motivo}:${dia}`;
      const avisar = estado.avisadoEm !== chaveAviso;
      estado.avisadoEm = chaveAviso;
      return { ok: false, motivo, avisar };
    }

    estado.recentes.push(agoraMs);
    estado.noDia += 1;
    return { ok: true };
  }

  /** Conta uma chamada ao Claude se couber no teto global do dia. Chamar logo antes de `extrair()`. */
  permitirClaude(agoraMs = Date.now()): boolean {
    const dia = diaEmSaoPaulo(agoraMs);
    if (this.claude.dia !== dia) this.claude = { dia, total: 0 };
    if (this.claude.total >= this.config.claudePorDia) return false;
    this.claude.total += 1;
    return true;
  }

  /** Evita crescer sem fim: some com chats sem mensagem hoje. */
  private limparDiasAntigos(dia: string) {
    if (this.chats.size < 1000) return;
    for (const [chave, estado] of this.chats) if (estado.dia !== dia) this.chats.delete(chave);
  }
}
