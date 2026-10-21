import {
  Baby, BookOpen, Briefcase, Bus, Car, Coffee, Dog, Dumbbell, Gift, GraduationCap, Heart, House,
  Lightbulb, Package, PartyPopper, PiggyBank, Pill, Plane, Shirt, ShoppingCart, Smartphone, Sprout,
  Tv, Utensils, Wallet, type LucideIcon,
} from 'lucide-react';

// Ícones disponíveis para categorias. A API guarda o nome (ex.: "shopping-cart").
export const ICONES: Record<string, LucideIcon> = {
  home: House,
  lightbulb: Lightbulb,
  'shopping-cart': ShoppingCart,
  utensils: Utensils,
  bus: Bus,
  car: Car,
  pill: Pill,
  heart: Heart,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  shirt: Shirt,
  'party-popper': PartyPopper,
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
  'piggy-bank': PiggyBank,
  sprout: Sprout,
  package: Package,
};

/** Cor usada quando o lançamento não tem categoria. */
export const COR_CATEGORIA_PADRAO = '#8A9A95';

/** Cor do ícone de entrada (verde-limão, mesmo valor do token `credito`). */
export const COR_ENTRADA = '#A3E635';
