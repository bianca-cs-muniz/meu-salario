// Palavras que apontam para uma categoria padrão (já normalizadas: minúsculas e sem acento).
// Um sinônimo só vale se a usuária tiver a categoria ativa com aquele nome.
import { normalizarNome } from "./agente.validacao";

export const SINONIMOS: Record<string, string[]> = {
  "Saúde": ["farmacia", "remedio", "drogaria", "medico", "consulta", "dentista", "exame"],
  Transporte: ["uber", "99", "onibus", "metro", "gasolina", "combustivel", "estacionamento", "pedagio", "taxi"],
  Comida: ["ifood", "restaurante", "padaria", "lanche", "almoco", "jantar", "cafe", "pizza"],
  Mercado: ["mercado", "feira", "supermercado", "hortifruti", "acougue"],
  "Contas da casa": ["luz", "agua", "internet", "gas", "energia", "telefone", "celular"],
  Moradia: ["aluguel", "condominio", "iptu"],
  Assinaturas: ["netflix", "spotify", "prime", "disney", "youtube", "hbo"],
  Lazer: ["cinema", "bar", "show", "viagem"],
  Roupa: ["roupa", "tenis", "sapato", "camisa", "calca"],
  "Educação": ["curso", "faculdade", "livro", "escola"],
};

/** palavra normalizada → nome normalizado da categoria padrão. */
export const CATEGORIA_POR_SINONIMO: ReadonlyMap<string, string> = new Map(
  Object.entries(SINONIMOS).flatMap(([categoria, palavras]) => palavras.map((p) => [normalizarNome(p), normalizarNome(categoria)] as const)),
);
