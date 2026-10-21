// ============================================================================
// CONTRATO COM A webApi
// Estes tipos descrevem exatamente o JSON que cada rota da API devolve.
// Se mudar algo aqui, mude na API (e vice-versa). Valores sempre em centavos.
// ============================================================================

export type TipoCarteira = "CONTA" | "VR";
export type GrupoCategoria = "ESSENCIAL" | "DESEJO" | "POUPANCA";
export type TipoLancamento = "ENTRADA" | "SAIDA";
export type FormaPagamento = "PIX" | "DEBITO" | "DINHEIRO" | "CREDITO" | "VR";
export type OrigemLancamento = "APP" | "WHATSAPP" | "RECORRENCIA";
export type StatusFatura = "ABERTA" | "FECHADA" | "PAGA" | "ATRASADA";

// ---------- autenticação ----------
export interface IUsuario {
  id: string;
  email: string;
  nome: string;
  telefoneWhatsapp: string | null;
}

export interface IRespostaAuth {
  token: string;
  usuario: IUsuario;
}

// ---------- carteiras ----------
export interface ICarteira {
  id: string;
  nome: string;
  tipo: TipoCarteira;
  ativa: boolean;
  saldoCentavos: number; // CONTA: sobra do mês atual · VR: saldo acumulado
}

// ---------- categorias ----------
export interface ICategoriaResumida {
  id: string;
  nome: string;
  icone: string;
  cor: string;
}

export interface ICategoria extends ICategoriaResumida {
  grupo: GrupoCategoria;
  limiteMensalCentavos: number | null;
  aceitaVr: boolean;
  ativa: boolean;
  gastoCentavos: number; // gasto na competência pedida (?competencia=), 0 se não informada
}

// ---------- cartões e faturas ----------
export interface ICartaoResumido {
  id: string;
  nome: string;
  cor: string;
}

export interface IFaturaResumo {
  id: string | null; // null quando ainda não existe registro (fatura sem lançamentos)
  cartaoId: string;
  competencia: string;
  fechamento: string; // ISO
  vencimento: string; // ISO
  pagaEm: string | null;
  totalCentavos: number;
  status: StatusFatura;
  cartao: ICartaoResumido;
}

export interface ICartao extends ICartaoResumido {
  diaFechamento: number;
  diaVencimento: number;
  limiteCentavos: number | null;
  ativo: boolean;
  faturaAtual: IFaturaResumo | null; // a próxima a vencer
  limiteUsadoCentavos: number; // soma de todas as faturas não pagas, incluindo parcelas futuras
  proximaCompetencia: string; // em que fatura cai uma compra feita HOJE
  proximoVencimento: string; // ISO do vencimento dessa fatura
}

export interface ITotalCategoria {
  categoriaId: string;
  nome: string;
  icone: string;
  cor: string;
  totalCentavos: number;
}

export interface IFaturaDetalhe extends IFaturaResumo {
  fixos: ILancamento[];
  parcelas: ILancamento[];
  avulsos: ILancamento[];
  porCategoria: ITotalCategoria[];
  proximas: { competencia: string; totalCentavos: number }[]; // próximos 3 meses
}

// ---------- recorrências (gastos fixos, salário, VR) ----------
export interface IRecorrencia {
  id: string;
  tipo: TipoLancamento;
  descricao: string;
  valorCentavos: number;
  diaDoMes: number;
  formaPagamento: FormaPagamento;
  categoriaId: string | null;
  carteiraId: string | null;
  cartaoId: string | null;
  inicio: string;
  fim: string | null;
  ativa: boolean;
  categoria: ICategoriaResumida | null;
  cartao: ICartaoResumido | null;
}

export interface ISalvarRecorrencia {
  tipo: TipoLancamento;
  descricao: string;
  valorCentavos: number;
  diaDoMes: number;
  formaPagamento: FormaPagamento;
  categoriaId?: string;
  carteiraId?: string;
  cartaoId?: string;
}

// ---------- lançamentos ----------
export interface ILancamento {
  id: string;
  tipo: TipoLancamento;
  descricao: string;
  valorCentavos: number;
  data: string; // ISO
  competencia: string;
  formaPagamento: FormaPagamento;
  categoriaId: string | null;
  carteiraId: string | null;
  cartaoId: string | null;
  parcelaNumero: number | null;
  parcelaTotal: number | null;
  grupoParcelaId: string | null;
  recorrenciaId: string | null;
  origem: OrigemLancamento;
  revisado: boolean;
  observacao: string | null;
  categoria: ICategoriaResumida | null;
  cartao: ICartaoResumido | null;
}

export interface ICriarLancamento {
  tipo: TipoLancamento;
  descricao: string;
  valorCentavos: number;
  data?: string;
  formaPagamento: FormaPagamento;
  categoriaId?: string;
  carteiraId?: string;
  cartaoId?: string;
  parcelas?: number;
}

export interface IEditarLancamento extends Partial<Omit<ICriarLancamento, "parcelas">> {
  aplicarEmParcelasFuturas?: boolean;
  revisado?: boolean;
}

export interface IFiltroLancamentos {
  competencia?: string;
  categoriaId?: string;
  cartaoId?: string;
  carteiraId?: string;
  formaPagamento?: FormaPagamento;
  tipo?: TipoLancamento;
  origem?: OrigemLancamento;
  revisado?: boolean;
  busca?: string;
}

export interface IImpacto {
  sobraCentavos: number;
  faturaTotalCentavos: number | null;
  faturaCompetencia: string | null;
  saldoVrCentavos: number | null;
  saldoInsuficiente: boolean;
}

export interface IRespostaCriarLancamento {
  lancamentos: ILancamento[];
  impacto: IImpacto;
}

// ---------- resumo ----------
export interface IResumoCategoria extends ITotalCategoria {
  grupo: GrupoCategoria;
  limiteMensalCentavos: number | null;
}

export interface IResumo {
  competencia: string;
  entradasCentavos: number;
  saidasCentavos: number;
  sobraCentavos: number;
  comprometidoPct: number; // 0 a 100+ (pode passar de 100)
  diasRestantes: number; // 0 para meses passados
  podeGastarPorDiaCentavos: number; // 0 quando não se aplica
  porCategoria: IResumoCategoria[]; // mesmas saídas de saidasCentavos (sem VR), do maior para o menor
  porGrupo: Record<GrupoCategoria, number>;
  vr: { carteiraId: string; saldoCentavos: number; entradasMesCentavos: number; saidasMesCentavos: number } | null;
  faturas: IFaturaResumo[]; // faturas que vencem na competência
  pendencias: number; // lançamentos com revisado = false (todos os meses)
  temEntradaFixa: boolean; // false = mostrar onboarding
}

export interface IEvolucaoMes {
  competencia: string;
  entradasCentavos: number;
  saidasCentavos: number;
  sobraCentavos: number;
}
