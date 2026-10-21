import { FormaPagamento, GrupoCategoria, StatusFatura } from "@/services/tipos";

export const ROTULO_FORMA: Record<FormaPagamento, string> = {
  PIX: "Pix",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  VR: "VR",
  DINHEIRO: "Dinheiro",
};

export const ROTULO_GRUPO: Record<GrupoCategoria, string> = {
  ESSENCIAL: "Essencial",
  DESEJO: "Desejos",
  POUPANCA: "Guardado",
};

export const META_GRUPO: Record<GrupoCategoria, number> = {
  ESSENCIAL: 50,
  DESEJO: 30,
  POUPANCA: 20,
};

export const ROTULO_STATUS_FATURA: Record<StatusFatura, string> = {
  ABERTA: "Aberta",
  FECHADA: "Fechada",
  PAGA: "Paga",
  ATRASADA: "Atrasada",
};

export const CLASSE_STATUS_FATURA: Record<StatusFatura, string> = {
  ABERTA: "bg-papel text-mudo",
  FECHADA: "bg-atencao-suave text-atencao",
  PAGA: "bg-dinheiro-suave text-dinheiro",
  ATRASADA: "bg-alerta-suave text-alerta",
};
