import { CreditCard, Inbox, List, Repeat, Settings, Tags, Wallet, type LucideIcon } from 'lucide-react';
import { rotas, type CaminhoRota } from '@constants/rotas';

export interface IItemNavegacao {
  rota: CaminhoRota;
  texto: string;
  icone: LucideIcon;
}

/** Barra inferior do celular (Painel, Lançamentos, Cartões) e topo da barra lateral. */
export const PRINCIPAIS: IItemNavegacao[] = [
  { rota: rotas.PAINEL, texto: 'Painel', icone: Wallet },
  { rota: rotas.LANCAMENTOS, texto: 'Lançamentos', icone: List },
  { rota: rotas.CARTOES, texto: 'Cartões', icone: CreditCard },
];

/** Menu "Mais" no celular e resto da barra lateral. */
export const SECUNDARIOS: IItemNavegacao[] = [
  { rota: rotas.PENDENCIAS, texto: 'Pendências', icone: Inbox },
  { rota: rotas.FIXOS, texto: 'Gastos fixos', icone: Repeat },
  { rota: rotas.CATEGORIAS, texto: 'Categorias', icone: Tags },
  { rota: rotas.CONFIGURACOES, texto: 'Configurações', icone: Settings },
];
