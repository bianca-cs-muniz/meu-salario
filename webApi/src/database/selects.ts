import { Prisma } from "@prisma/client";

// Campos que a API devolve de cada model (iguais a webApp/src/services/tipos.ts).
// Nunca devolver usuarioId, criadoEm, senha, geradaAte nem mesRecorrencia.

export const usuarioSelect = { id: true, email: true, nome: true, telefoneWhatsapp: true } satisfies Prisma.UsuarioSelect;

export const carteiraSelect = { id: true, nome: true, tipo: true, ativa: true } satisfies Prisma.CarteiraSelect;

export const categoriaResumidaSelect = { id: true, nome: true, icone: true, cor: true } satisfies Prisma.CategoriaSelect;

export const categoriaSelect = {
  ...categoriaResumidaSelect,
  grupo: true,
  limiteMensalCentavos: true,
  aceitaVr: true,
  ativa: true,
} satisfies Prisma.CategoriaSelect;

export const cartaoResumidoSelect = { id: true, nome: true, cor: true } satisfies Prisma.CartaoSelect;

export const cartaoSelect = {
  ...cartaoResumidoSelect,
  diaFechamento: true,
  diaVencimento: true,
  limiteCentavos: true,
  ativo: true,
} satisfies Prisma.CartaoSelect;

export const lancamentoSelect = {
  id: true,
  tipo: true,
  descricao: true,
  valorCentavos: true,
  data: true,
  competencia: true,
  formaPagamento: true,
  categoriaId: true,
  carteiraId: true,
  cartaoId: true,
  parcelaNumero: true,
  parcelaTotal: true,
  grupoParcelaId: true,
  recorrenciaId: true,
  origem: true,
  revisado: true,
  observacao: true,
  categoria: { select: categoriaResumidaSelect },
  cartao: { select: cartaoResumidoSelect },
} satisfies Prisma.LancamentoSelect;

export const recorrenciaSelect = {
  id: true,
  tipo: true,
  descricao: true,
  valorCentavos: true,
  diaDoMes: true,
  formaPagamento: true,
  categoriaId: true,
  carteiraId: true,
  cartaoId: true,
  inicio: true,
  fim: true,
  ativa: true,
  categoria: { select: categoriaResumidaSelect },
  cartao: { select: cartaoResumidoSelect },
} satisfies Prisma.RecorrenciaSelect;

export type LancamentoApi = Prisma.LancamentoGetPayload<{ select: typeof lancamentoSelect }>;
export type CartaoApi = Prisma.CartaoGetPayload<{ select: typeof cartaoSelect }>;
export type CategoriaApi = Prisma.CategoriaGetPayload<{ select: typeof categoriaSelect }>;

/** Cliente do Prisma ou transação em andamento. */
export type Db = Prisma.TransactionClient;
