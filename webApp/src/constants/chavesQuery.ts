/** Chaves do TanStack Query. Cada feature usa a sua como prefixo. */
export const CHAVES = {
  MEU_PERFIL: ['meu-perfil'],
  LANCAMENTOS: ['lancamentos'],
  RESUMO: ['resumo'],
  EVOLUCAO: ['evolucao'],
  CATEGORIAS: ['categorias'],
  CARTOES: ['cartoes'],
  FATURAS: ['faturas'],
  FIXOS: ['fixos'],
  CARTEIRAS: ['carteiras'],
  TELEGRAM: ['telegram'],
} as const;

/** Tudo que muda quando um lançamento, cartão, fixo etc. é salvo (substitui o antigo `avisarMudanca`). */
export const CHAVES_FINANCEIRAS = [
  CHAVES.LANCAMENTOS,
  CHAVES.RESUMO,
  CHAVES.EVOLUCAO,
  CHAVES.CATEGORIAS,
  CHAVES.CARTOES,
  CHAVES.FATURAS,
  CHAVES.FIXOS,
  CHAVES.CARTEIRAS,
];
