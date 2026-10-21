import type { FormaPagamento, GrupoCategoria, StatusFatura } from '@services/tipos';

export const ROTULO_FORMA: Record<FormaPagamento, string> = {
  PIX: 'Pix',
  DEBITO: 'Débito',
  CREDITO: 'Crédito',
  VR: 'VR',
  DINHEIRO: 'Dinheiro',
};

export const ROTULO_GRUPO: Record<GrupoCategoria, string> = {
  ESSENCIAL: 'Essencial',
  DESEJO: 'Desejos',
  POUPANCA: 'Guardado',
};

export const META_GRUPO: Record<GrupoCategoria, number> = {
  ESSENCIAL: 50,
  DESEJO: 30,
  POUPANCA: 20,
};

export const ROTULO_STATUS_FATURA: Record<StatusFatura, string> = {
  ABERTA: 'Aberta',
  FECHADA: 'Fechada',
  PAGA: 'Paga',
  ATRASADA: 'Atrasada',
};

/** Nome de um token de `theme.palette.cores`. */
type TokenCor =
  | 'papel'
  | 'mudo'
  | 'atencao'
  | 'atencaoSuave'
  | 'dinheiro'
  | 'dinheiroSuave'
  | 'latao'
  | 'alerta'
  | 'alertaSuave'
  | 'cofreDestaque'
  | 'cofreAlerta';

/**
 * Cores do selo de status da fatura (tokens do tema: `theme.vars.palette.cores[fundo]`).
 * `textoSobreCofre` é usado quando o selo fica sobre o fundo escuro (destaque da fatura).
 */
export const CLASSE_STATUS_FATURA: Record<StatusFatura, { fundo: TokenCor; texto: TokenCor; textoSobreCofre: TokenCor }> = {
  ABERTA: { fundo: 'papel', texto: 'mudo', textoSobreCofre: 'mudo' },
  FECHADA: { fundo: 'atencaoSuave', texto: 'atencao', textoSobreCofre: 'atencao' },
  PAGA: { fundo: 'dinheiroSuave', texto: 'latao', textoSobreCofre: 'cofreDestaque' },
  ATRASADA: { fundo: 'alertaSuave', texto: 'alerta', textoSobreCofre: 'cofreAlerta' },
};
