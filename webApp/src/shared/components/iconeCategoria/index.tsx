import { Package } from 'lucide-react';
import { COR_CATEGORIA_PADRAO, ICONES } from './icones';
import { Circulo } from './styles';

export const Icone = ({ nome, tamanho = 18 }: { nome: string; tamanho?: number }) => {
  const Componente = ICONES[nome] ?? Package;
  return <Componente size={tamanho} strokeWidth={1.6} aria-hidden />;
};

interface IIconeCategoria {
  nome?: string;
  cor?: string;
  tamanho?: number;
}

/** Círculo colorido com o ícone da categoria. */
export const IconeCategoria = ({ nome = 'package', cor = COR_CATEGORIA_PADRAO, tamanho = 36 }: IIconeCategoria) => (
  <Circulo cor={cor} tamanho={tamanho}>
    <Icone nome={nome} tamanho={Math.round(tamanho * 0.5)} />
  </Circulo>
);
