import { Prisma } from "@prisma/client";
import appConfig from "@config/app.config";
import AppException from "@erros/app-exception";
import { competenciaAtual, REGEX_COMPETENCIA } from "@helpers/competencia.helper";
import GastosFixosService from "@modulos/gastos-fixos/gastos-fixos.service";
import LancamentosService from "@modulos/lancamentos/lancamentos.service";
import LancamentosRepository from "@modulos/lancamentos/lancamentos.repository";
import ResumoService from "@modulos/resumo/resumo.service";
import CategoriasService from "@modulos/categorias/categorias.service";
import CartoesService from "@modulos/cartoes/cartoes.service";
import Repository from "../telegram.repository";
import TelegramCliente, { TelegramErro } from "../telegram.cliente";
import { codigoTemFormatoValido, hashCodigo } from "../telegram.seguranca";
import { Limitador } from "../limitador";
import { UpdateTelegramDto } from "../dtos/update.dto";
import { extrair, Extracao } from "./agente.extracao";
import { interpretar } from "./agente.regras";
import { normalizarNome, validarLancamento } from "./agente.validacao";
import Respostas from "./agente.respostas";

/** Mensagens maiores que isso não vão ao Claude. */
export const MAX_CARACTERES = 500;
const JANELA_APAGAR_MS = 24 * 60 * 60 * 1000;

/** Quem leu a mensagem: o leitor por regras, o Claude (reserva) ou ninguém (sem chave, respondeu o formato). */
export type Caminho = "REGRAS" | "CLAUDE" | "SEM_CLAUDE";

/** Resultado do processamento (só para log: nunca texto nem valores). */
export type ResultadoProcessamento = { intencao: string; caminho?: Caminho };

type Usuario = { id: string; nome: string };

const formatoDia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" });
const formatoSemana = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long" });

/** Nome do erro e status quando houver (para log): nunca a mensagem, que pode ter texto ou valores. */
function resumoDoErro(erro: unknown) {
  const comStatus = erro as { name?: string; code?: string; status?: number } | null;
  return { erro: erro instanceof Error ? erro.name : "desconhecido", codigo: comStatus?.code, status: comStatus?.status };
}

/** "/start abc", "/ajuda@MeuBot" → { nome: "start", argumento: "abc" }. */
function lerComando(texto: string): { nome: string; argumento: string } | null {
  const partes = /^\/([A-Za-z0-9_]+)(?:@[A-Za-z0-9_]+)?(?:\s+([\s\S]*))?$/.exec(texto);
  return partes ? { nome: partes[1].toLowerCase(), argumento: (partes[2] ?? "").trim() } : null;
}

class AgenteService {
  readonly limitador = new Limitador();

  /** Processa um update do webhook (já validado). Responde no chat; erros de envio não sobem. */
  async processar(update: UpdateTelegramDto): Promise<ResultadoProcessamento> {
    const mensagem = update.message;
    if (!mensagem || mensagem.chat.type !== "private") return { intencao: "IGNORADO" };
    const chatId = String(mensagem.chat.id);

    if (typeof mensagem.text !== "string") return this.responder(chatId, Respostas.SO_TEXTO, "NAO_TEXTO");
    const texto = mensagem.text.trim();
    if (!texto) return this.responder(chatId, Respostas.SO_TEXTO, "NAO_TEXTO");
    if (texto.length > MAX_CARACTERES) return this.responder(chatId, Respostas.MENSAGEM_LONGA, "LONGA");

    // Daqui em diante há leitura/escrita no banco: qualquer falha inesperada vira "tenta de novo" no chat
    // (e o log leva só nome/status do erro, nunca a mensagem).
    try {
      const comando = lerComando(texto);
      if (comando?.nome === "start" && comando.argumento) return await this.vincular(chatId, comando.argumento, mensagem.from?.username ?? null);

      const usuario = await Repository.readPorChat(chatId);
      if (!usuario) return await this.responder(chatId, Respostas.NAO_VINCULADO, "NAO_VINCULADO");

      if (comando?.nome === "desconectar") {
        await Repository.desvincularChat(chatId);
        return await this.responder(chatId, Respostas.DESCONECTADO, "DESCONECTAR");
      }

      // /sobra, /fatura, /gasto, /apagar, /ajuda (e comandos desconhecidos) passam pelas regras.
      return await this.conversar(update.update_id, chatId, texto, usuario);
    } catch (erro) {
      console.error("[telegram] falha ao processar mensagem", resumoDoErro(erro));
      return this.responder(chatId, Respostas.FALHA, "FALHA");
    }
  }

  /** /start <código>: liga o chat à conta dona do código (uso único, 10 min). Avisa se o chat mudou de conta. */
  private async vincular(chatId: string, codigo: string, username: string | null): Promise<ResultadoProcessamento> {
    const vinculado = codigoTemFormatoValido(codigo) ? await Repository.vincular(hashCodigo(codigo), chatId, username) : null;
    if (!vinculado) return this.responder(chatId, Respostas.LINK_EXPIRADO, "VINCULO_INVALIDO");
    const texto = vinculado.trocouConta ? `${Respostas.conectado(vinculado.nome)}\n\n${Respostas.CHAT_MOVIDO}` : Respostas.conectado(vinculado.nome);
    return this.responder(chatId, texto, vinculado.trocouConta ? "VINCULO_MOVIDO" : "VINCULO");
  }

  /** Mensagem de um chat ligado: idempotência → limite do chat → regras (Claude só como reserva, com teto global) → validação → execução → resposta. */
  private async conversar(updateId: number, chatId: string, texto: string, usuario: Usuario): Promise<ResultadoProcessamento> {
    // O Telegram pode reenviar o mesmo update: o único (canal, idExterno) barra o segundo (antes de gastar cota).
    try {
      await Repository.registrarMensagem({ usuarioId: usuario.id, papel: "USUARIO", texto, idExterno: String(updateId) });
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") return { intencao: "DUPLICADO" };
      throw erro;
    }

    const limite = this.limitador.permitirChat(chatId);
    if (!limite.ok) {
      if (limite.avisar) await this.enviar(chatId, Respostas.limite(limite.motivo));
      return { intencao: `LIMITE_${limite.motivo}` };
    }

    await TelegramCliente.digitando(chatId).catch(() => undefined);
    // O middleware gerar-recorrencias não passa pelo webhook: gera os fixos aqui.
    await GastosFixosService.gerarPendentes(usuario.id).catch((erro: unknown) =>
      console.error("[telegram] falha ao gerar gastos fixos", { erro: erro instanceof Error ? erro.name : "desconhecido" }),
    );

    const contexto = await Repository.readContexto(usuario.id);
    const agora = new Date();
    const hoje = formatoDia.format(agora);

    let extracao: Extracao | null = interpretar(texto, { hoje, categorias: contexto.categorias, cartoes: contexto.cartoes });
    let caminho: Caminho = "REGRAS";
    if (!extracao) {
      // Comando desconhecido ("/xyz"): ajuda, sem Claude.
      if (texto.startsWith("/")) return this.responder(chatId, Respostas.ajuda(), "AJUDA", usuario, "REGRAS");
      if (!appConfig.anthropic.habilitado) return this.responder(chatId, Respostas.FORMATO, "DESCONHECIDO", usuario, "SEM_CLAUDE");
      // Teto global diário de chamadas ao Claude: estourado, responde o formato sem chamar.
      if (!this.limitador.permitirClaude()) return this.responder(chatId, Respostas.FORMATO, "LIMITE_GLOBAL", usuario, "SEM_CLAUDE");
      caminho = "CLAUDE";
      const resultado = await extrair(texto, {
        hoje,
        diaDaSemana: formatoSemana.format(agora),
        categorias: contexto.categorias.map((c) => ({ nome: c.nome, aceitaVr: c.aceitaVr })),
        cartoes: contexto.cartoes.map((c) => c.nome),
        temCarteiraVr: contexto.temCarteiraVr,
      });
      if (!resultado.ok) return this.responder(chatId, resultado.resposta, resultado.motivo, usuario, caminho);
      extracao = resultado.extracao;
    }

    let resposta: string;
    try {
      resposta = await this.executar(usuario.id, extracao, { mensagem: texto, hoje, ...contexto });
    } catch (erro) {
      if (erro instanceof AppException && erro.status >= 400 && erro.status < 500) resposta = erro.message;
      else {
        console.error("[telegram] falha ao executar", { intencao: extracao.intencao, erro: erro instanceof Error ? erro.name : "desconhecido" });
        resposta = Respostas.FALHA;
      }
    }
    return this.responder(chatId, resposta, extracao.intencao, usuario, caminho);
  }

  private async executar(usuarioId: string, extracao: Extracao, contexto: Parameters<typeof validarLancamento>[1]): Promise<string> {
    switch (extracao.intencao) {
      case "REGISTRAR":
        return this.registrar(usuarioId, extracao, contexto);
      case "CONSULTAR_SOBRA": {
        const competencia = this.competencia(extracao);
        const resumo = await ResumoService.read(usuarioId, competencia);
        return Respostas.sobra({ ...resumo, competencia });
      }
      case "CONSULTAR_CATEGORIA":
        return this.consultarCategoria(usuarioId, extracao);
      case "CONSULTAR_FATURA":
        return this.consultarFatura(usuarioId, extracao.consulta?.cartaoNome ?? null);
      case "APAGAR_ULTIMO":
        return this.apagarUltimo(usuarioId);
      case "AJUDA":
        return Respostas.ajuda();
      default:
        return Respostas.desconhecido();
    }
  }

  private async registrar(usuarioId: string, extracao: Extracao, contexto: Parameters<typeof validarLancamento>[1]) {
    const validado = validarLancamento(extracao, contexto);
    if ("perguntar" in validado) return validado.perguntar;
    const { dto, revisado, observacao, motivos, categoriaNome, cartaoNome } = validado.ok;
    const { impacto } = await LancamentosService.create(usuarioId, dto, { origem: "TELEGRAM", revisado, observacao });
    return Respostas.lancado({ ...dto, categoriaNome, cartaoNome, revisado, motivos, impacto });
  }

  /** Competência citada na consulta (se válida) ou a atual. */
  private competencia(extracao: Extracao) {
    const citada = extracao.consulta?.competencia;
    return citada && REGEX_COMPETENCIA.test(citada) ? citada : competenciaAtual();
  }

  private async consultarCategoria(usuarioId: string, extracao: Extracao) {
    const competencia = this.competencia(extracao);
    const categorias = (await CategoriasService.read(usuarioId, competencia)).filter((c) => c.ativa);
    const nome = extracao.consulta?.categoriaNome?.trim();
    if (!nome) {
      const comGasto = categorias.filter((c) => c.gastoCentavos > 0).sort((a, b) => b.gastoCentavos - a.gastoCentavos);
      return Respostas.categoriasDoMes(competencia, comGasto.slice(0, 8));
    }
    const categoria = categorias.find((c) => normalizarNome(c.nome) === normalizarNome(nome));
    if (!categoria) return Respostas.categoriaNaoEncontrada(nome, categorias.map((c) => c.nome));
    return Respostas.categoria({ ...categoria, competencia });
  }

  private async consultarFatura(usuarioId: string, cartaoNome: string | null) {
    const cartoes = (await CartoesService.read(usuarioId)).filter((c) => c.ativo);
    if (!cartoes.length) return Respostas.semCartao();
    const nome = cartaoNome?.trim();
    if (nome) {
      const cartao = cartoes.find((c) => normalizarNome(c.nome) === normalizarNome(nome));
      return cartao ? Respostas.fatura(cartao) : Respostas.cartaoNaoEncontrado(nome, cartoes.map((c) => c.nome));
    }
    return cartoes.map((c) => Respostas.fatura(c)).join("\n\n");
  }

  /** Apaga o último lançamento feito pelo Telegram nas últimas 24 h (compra parcelada: o grupo todo). */
  private async apagarUltimo(usuarioId: string) {
    const ultimo = await LancamentosRepository.readUltimoPorOrigem(usuarioId, "TELEGRAM", new Date(Date.now() - JANELA_APAGAR_MS));
    if (!ultimo) return Respostas.NADA_PARA_APAGAR;
    if (ultimo.grupoParcelaId) {
      const grupo = await LancamentosRepository.readGrupo(usuarioId, ultimo.grupoParcelaId, { gte: 1 });
      const primeira = grupo[0] ?? ultimo;
      await LancamentosService.delete(usuarioId, primeira.id, true);
      return Respostas.apagado({
        descricao: primeira.descricao.replace(/ \(\d+\/\d+\)$/, ""),
        valorCentavos: grupo.reduce((soma, l) => soma + l.valorCentavos, 0),
        data: primeira.data,
        parcelas: primeira.parcelaTotal,
      });
    }
    await LancamentosService.delete(usuarioId, ultimo.id);
    return Respostas.apagado({ descricao: ultimo.descricao, valorCentavos: ultimo.valorCentavos, data: ultimo.data, parcelas: null });
  }

  /** Envia e, se o chat é de um usuário, grava a resposta no histórico. */
  private async responder(chatId: string, texto: string, intencao: string, usuario?: Usuario, caminho?: Caminho): Promise<ResultadoProcessamento> {
    const enviado = await this.enviar(chatId, texto);
    if (enviado && usuario) {
      await Repository.registrarMensagem({ usuarioId: usuario.id, papel: "AGENTE", texto }).catch((erro: unknown) =>
        console.error("[telegram] falha ao gravar resposta", { erro: erro instanceof Error ? erro.name : "desconhecido" }),
      );
    }
    return caminho ? { intencao, caminho } : { intencao };
  }

  /** sendMessage que nunca derruba o processamento. 403 (bot bloqueado) desliga o chat. */
  private async enviar(chatId: string, texto: string): Promise<boolean> {
    try {
      await TelegramCliente.enviarMensagem(chatId, texto);
      return true;
    } catch (erro) {
      if (erro instanceof TelegramErro) {
        console.error("[telegram] falha no sendMessage", { status: erro.status, descricao: erro.descricao });
        if (erro.status === 403) await Repository.desvincularChat(chatId).catch(() => undefined);
      } else {
        console.error("[telegram] falha no sendMessage", { erro: erro instanceof Error ? erro.name : "desconhecido" });
      }
      return false;
    }
  }
}

export default new AgenteService();
