"use client";

import {
  Baby, BookOpen, Briefcase, Bus, Car, Coffee, Dog, Dumbbell, Gift, GraduationCap, Heart, House,
  Lightbulb, Package, PartyPopper, PiggyBank, Pill, Plane, Shirt, ShoppingCart, Smartphone, Sprout,
  Tv, Utensils, Wallet, type LucideIcon,
} from "lucide-react";

// Ícones disponíveis para categorias. A API guarda o nome (ex.: "shopping-cart").
export const ICONES: Record<string, LucideIcon> = {
  home: House,
  lightbulb: Lightbulb,
  "shopping-cart": ShoppingCart,
  utensils: Utensils,
  bus: Bus,
  car: Car,
  pill: Pill,
  heart: Heart,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  shirt: Shirt,
  "party-popper": PartyPopper,
  tv: Tv,
  smartphone: Smartphone,
  coffee: Coffee,
  plane: Plane,
  gift: Gift,
  dumbbell: Dumbbell,
  baby: Baby,
  dog: Dog,
  briefcase: Briefcase,
  wallet: Wallet,
  "piggy-bank": PiggyBank,
  sprout: Sprout,
  package: Package,
};

export function Icone({ nome, tamanho = 18 }: { nome: string; tamanho?: number }) {
  const Componente = ICONES[nome] ?? Package;
  return <Componente size={tamanho} strokeWidth={1.6} aria-hidden />;
}

/** Quadradinho colorido com o ícone da categoria. */
export function IconeCategoria({ nome, cor, tamanho = 36 }: { nome: string; cor: string; tamanho?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full"
      style={{ width: tamanho, height: tamanho, background: `${cor}14`, boxShadow: `inset 0 0 0 1px ${cor}40`, color: cor }}
    >
      <Icone nome={nome} tamanho={Math.round(tamanho * 0.5)} />
    </span>
  );
}
