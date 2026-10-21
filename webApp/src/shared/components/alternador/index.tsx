import { Container } from './styles';

interface IAlternador<T extends string> {
  opcoes: { valor: T; texto: string }[];
  valor: T;
  aoMudar: (v: T) => void;
}

export const Alternador = <T extends string>({ opcoes, valor, aoMudar }: IAlternador<T>) => (
  <Container>
    {opcoes.map((o) => (
      <button
        key={o.valor}
        type="button"
        aria-pressed={o.valor === valor}
        onClick={() => aoMudar(o.valor)}
        className={o.valor === valor ? 'opcao ativa' : 'opcao'}
      >
        {o.texto}
      </button>
    ))}
  </Container>
);
