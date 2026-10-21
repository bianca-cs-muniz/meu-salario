import { Container } from './styles';

interface IChips<T extends string> {
  opcoes: { valor: T; texto: string }[];
  valor: T | null;
  aoMudar: (v: T) => void;
  rotulo: string;
}

/** Botões tipo "chip" para escolher uma opção entre poucas. */
export const Chips = <T extends string>({ opcoes, valor, aoMudar, rotulo }: IChips<T>) => (
  <Container role="radiogroup" aria-label={rotulo}>
    {opcoes.map((o) => {
      const ativo = o.valor === valor;
      return (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={ativo}
          onClick={() => aoMudar(o.valor)}
          className={ativo ? 'chip ativo' : 'chip'}
        >
          {o.texto}
        </button>
      );
    })}
  </Container>
);
