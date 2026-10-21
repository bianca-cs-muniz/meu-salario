export const rotas = {
  LOGIN: '/login',
  REGISTRAR: '/registrar',

  PAINEL: '/painel',
  LANCAMENTOS: '/lancamentos',
  CARTOES: '/cartoes',
  PENDENCIAS: '/pendencias',
  FIXOS: '/fixos',
  CATEGORIAS: '/categorias',
  CONFIGURACOES: '/configuracoes',
} as const;

/** Para onde o usuário logado vai ao abrir o app. Volta a ser o Painel quando ele for migrado. */
export const ROTA_INICIAL = rotas.PAINEL;

export const rotasDinamicas = {
  FATURA: (id: string, competencia?: string) =>
    `${rotas.CARTOES}/${id}${competencia ? `?competencia=${competencia}` : ''}`,
};

export type ChaveRota = keyof typeof rotas;
export type CaminhoRota = typeof rotas[keyof typeof rotas];
