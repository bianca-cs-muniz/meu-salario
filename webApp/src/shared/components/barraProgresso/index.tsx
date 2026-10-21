import { Preenchimento, Trilho } from './styles';

interface IBarraProgresso {
  /** 0 a 100 (valores fora disso são limitados). */
  valor: number;
  /** Cor da barra (ex.: cor da categoria). Padrão: dinheiro. */
  cor?: string;
  /** Pinta a barra de alerta. */
  alerta?: boolean;
}

export const BarraProgresso = ({ valor, cor, alerta }: IBarraProgresso) => {
  const pct = Math.max(0, Math.min(100, valor));
  return (
    <Trilho>
      <Preenchimento pct={pct} cor={cor} alerta={alerta} />
    </Trilho>
  );
};
