import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";
import appConfig from "@config/app.config";
import Respostas from "./agente.respostas";

// Extração estruturada com o Claude: transforma uma mensagem curta em intenção + campos.
// O modelo NÃO recebe ids, e-mail, senha, token nem valores do banco: só nomes de categorias e cartões.
// O schema usa zod/v4 (exigido pelo helper do SDK); o resto da API continua no zod v3.

const formas = ["PIX", "DEBITO", "CREDITO", "VR", "DINHEIRO"] as const;
export const INTENCOES = ["REGISTRAR", "CONSULTAR_SOBRA", "CONSULTAR_CATEGORIA", "CONSULTAR_FATURA", "APAGAR_ULTIMO", "AJUDA", "DESCONHECIDO"] as const;

// Strict: todos os campos obrigatórios; ausência = null. Restrições numéricas ficam na validação (agente.validacao).
export const ExtracaoSchema = z.object({
  intencao: z.enum(INTENCOES),
  lancamento: z
    .object({
      tipo: z.enum(["ENTRADA", "SAIDA"]),
      valorCentavos: z.number().int().nullable(),
      descricao: z.string(),
      categoriaNome: z.string().nullable(),
      formaPagamento: z.enum(formas).nullable(),
      cartaoNome: z.string().nullable(),
      parcelas: z.number().int().nullable(),
      data: z.string().nullable().describe("AAAA-MM-DD"),
      duvida: z.string().nullable(),
    })
    .nullable(),
  consulta: z
    .object({
      categoriaNome: z.string().nullable(),
      cartaoNome: z.string().nullable(),
      competencia: z.string().nullable().describe("AAAA-MM"),
    })
    .nullable(),
});
export type Extracao = z.infer<typeof ExtracaoSchema>;
export type LancamentoExtraido = NonNullable<Extracao["lancamento"]>;

/** Contexto variável enviado ao modelo (só nomes; nada de ids ou valores). */
export type ContextoModelo = {
  hoje: string; // "AAAA-MM-DD" em America/Sao_Paulo
  diaDaSemana: string;
  categorias: { nome: string; aceitaVr: boolean }[];
  cartoes: string[];
  temCarteiraVr: boolean;
};

export type ResultadoExtracao =
  | { ok: true; extracao: Extracao }
  | { ok: false; motivo: "RECUSA" | "NAO_ENTENDI" | "OCUPADO" | "SEM_CONEXAO" | "ERRO_API"; resposta: string };

/** Bloco fixo (cacheado): regras, formato, gírias e exemplos. Não colocar nada variável aqui. */
export const PROMPT_FIXO = `Você é o "estagiário" do app de finanças Meu Salário. Você lê UMA mensagem curta em português do Brasil, enviada pelo Telegram, e devolve só os campos pedidos. Você não conversa e não executa nada: o app confere e decide.

Intenções:
- REGISTRAR: a pessoa conta um gasto ou um dinheiro que entrou.
- CONSULTAR_SOBRA: quanto sobra no mês, quanto ainda pode gastar.
- CONSULTAR_CATEGORIA: quanto gastou numa categoria.
- CONSULTAR_FATURA: valor ou vencimento da fatura de um cartão.
- APAGAR_ULTIMO: desfazer/apagar o último lançamento que ela mandou por aqui.
- AJUDA: pergunta o que você sabe fazer.
- DESCONHECIDO: qualquer outra coisa (cumprimentos, conversa, pedidos fora do app).

Lançamento (só em REGISTRAR; nas outras intenções lancamento = null):
- tipo: SAIDA para gasto; ENTRADA para dinheiro recebido (salário, pix recebido, reembolso, recarga do VR).
- valorCentavos: inteiro em centavos. "45" = 4500; "45,90" = 4590; "45.90" = 4590; "1.200" = 120000; "2 mil" = 200000; "R$ 12" = 1200. Sem valor na mensagem = null. Nunca invente valor.
- descricao: curta, com inicial maiúscula, só o que foi comprado ou recebido ("Mercado", "Uber", "Almoço"), sem valor nem forma de pagamento.
- categoriaNome: UMA categoria da lista do contexto, escrita igual. Se nenhuma servir = null. Em ENTRADA normalmente null.
- formaPagamento: "pix" = PIX; "débito" = DEBITO; "cartão", "crédito", "no cartão", "parcelado", "em 3x" = CREDITO; "vr", "va", "vale", "vale-refeição", "vale-alimentação", "alelo", "sodexo", "ticket", "flash" = VR; "dinheiro", "em espécie" = DINHEIRO. Não citou = null (não adivinhe).
- cartaoNome: cartão citado ("no nubank" = "Nubank"), igual à lista quando der. Não citou = null.
- parcelas: "em 3x", "3 vezes", "parcelei em 10" = número. À vista ou não citou = null.
- data: "AAAA-MM-DD". "Hoje" ou sem data = null. "Ontem", "anteontem", "sexta", "dia 5": calcule a partir de hoje (contexto), nunca no futuro.
- duvida: frase curta quando algo ficou ambíguo; senão null.

Consulta (só em CONSULTAR_SOBRA, CONSULTAR_CATEGORIA e CONSULTAR_FATURA; nas outras = null):
- categoriaNome: categoria citada (igual à lista quando der) ou null.
- cartaoNome: cartão citado ou null.
- competencia: "AAAA-MM" quando citar um mês ("em setembro", "mês passado"); senão null.

Exemplos (mensagem: campos principais):
1. "mercado 230 no vr": REGISTRAR, SAIDA, 23000, "Mercado", categoria Mercado, VR
2. "uber 18,50": REGISTRAR, SAIDA, 1850, "Uber", categoria Transporte, forma null
3. "almoço 32 pix": REGISTRAR, SAIDA, 3200, "Almoço", categoria Comida, PIX
4. "tênis 300 em 3x no cartão inter": REGISTRAR, SAIDA, 30000, "Tênis", categoria Roupa, CREDITO, cartão "Inter", parcelas 3
5. "ontem paguei 45 de farmácia no débito": REGISTRAR, SAIDA, 4500, "Farmácia", categoria Saúde, DEBITO, data de ontem
6. "netflix 55,90 cartão": REGISTRAR, SAIDA, 5590, "Netflix", categoria Assinaturas, CREDITO, cartão null
7. "caiu o salário 3.500": REGISTRAR, ENTRADA, 350000, "Salário", categoria null, forma null
8. "gastei no mercado": REGISTRAR, SAIDA, valor null, "Mercado", categoria Mercado
9. "quanto sobrou esse mês?": CONSULTAR_SOBRA
10. "quanto gastei com comida em setembro?": CONSULTAR_CATEGORIA, categoria Comida, competencia de setembro
11. "quanto tá a fatura do nubank?": CONSULTAR_FATURA, cartão "Nubank"
12. "apaga o último" ou "errei, desfaz": APAGAR_ULTIMO
13. "o que você faz?": AJUDA
14. "bom dia!": DESCONHECIDO
(As categorias dos exemplos só valem se existirem na lista do contexto.)`;

/** Bloco variável (depois do breakpoint do cache): data de hoje e nomes do usuário. */
export function montarContextoTexto(contexto: ContextoModelo): string {
  const categorias = contexto.categorias.length
    ? contexto.categorias.map((c) => (c.aceitaVr ? `${c.nome} (aceita VR)` : c.nome)).join("; ")
    : "nenhuma";
  return [
    `Hoje: ${contexto.hoje} (${contexto.diaDaSemana}), fuso America/Sao_Paulo.`,
    `Categorias: ${categorias}.`,
    `Cartões de crédito: ${contexto.cartoes.length ? contexto.cartoes.join("; ") : "nenhum"}.`,
    `Carteira VR: ${contexto.temCarteiraVr ? "sim" : "não"}.`,
  ].join("\n");
}

export function montarSistema(contexto: ContextoModelo): Anthropic.Messages.TextBlockParam[] {
  return [
    { type: "text", text: PROMPT_FIXO, cache_control: { type: "ephemeral" } },
    { type: "text", text: montarContextoTexto(contexto) },
  ];
}

let clientePadrao: Anthropic | null = null;
/** Singleton (lê ANTHROPIC_API_KEY do ambiente). */
function obterCliente(): Anthropic {
  clientePadrao ??= new Anthropic({ timeout: 15_000, maxRetries: 2 });
  return clientePadrao;
}

/** Interface mínima usada (permite injetar um cliente falso nos testes). */
export type ClienteMensagens = { messages: { parse: Anthropic["messages"]["parse"] } };

export async function extrair(texto: string, contexto: ContextoModelo, cliente: ClienteMensagens = obterCliente()): Promise<ResultadoExtracao> {
  try {
    const resposta = await cliente.messages.parse({
      model: appConfig.anthropic.modelo,
      max_tokens: 2048,
      system: montarSistema(contexto),
      messages: [{ role: "user", content: texto }],
      output_config: { effort: "low", format: zodOutputFormat(ExtracaoSchema) },
    });
    if (resposta.stop_reason === "refusal") return { ok: false, motivo: "RECUSA", resposta: Respostas.RECUSA };
    if (resposta.stop_reason === "max_tokens" || !resposta.parsed_output) return { ok: false, motivo: "NAO_ENTENDI", resposta: Respostas.NAO_ENTENDI };
    return { ok: true, extracao: resposta.parsed_output };
  } catch (erro) {
    if (erro instanceof Anthropic.RateLimitError) return { ok: false, motivo: "OCUPADO", resposta: Respostas.OCUPADO };
    if (erro instanceof Anthropic.APIConnectionError) return { ok: false, motivo: "SEM_CONEXAO", resposta: Respostas.SEM_CONEXAO };
    if (erro instanceof Anthropic.APIError) {
      console.error("[telegram] erro da API do Claude", { status: erro.status, requestId: erro.requestID ?? null });
      return { ok: false, motivo: "ERRO_API", resposta: Respostas.SEM_CONEXAO };
    }
    // JSON fora do schema (ex.: resposta cortada): o helper falha ao interpretar.
    console.error("[telegram] saída do Claude não interpretada", { erro: erro instanceof Error ? erro.name : "desconhecido" });
    return { ok: false, motivo: "NAO_ENTENDI", resposta: Respostas.NAO_ENTENDI };
  }
}
