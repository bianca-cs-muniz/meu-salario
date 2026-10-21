import { useState, type Ref } from 'react';
import { centavosParaTexto, textoParaCentavos } from '@utils/dinheiro';
import { Container } from './styles';

interface ICampoDinheiro {
  /** Valor em centavos (ou null). Compatível com `<Controller>` (`field.value`). */
  value: number | null | undefined;
  /** Recebe centavos, ou null se o texto não for um valor. Compatível com `field.onChange`. */
  onChange: (centavos: number | null) => void;
  onBlur?: () => void;
  name?: string;
  inputRef?: Ref<HTMLInputElement>;
  grande?: boolean;
  autoFocus?: boolean;
  id?: string;
  rotuloAcessivel?: string;
}

/**
 * Campo de valor em reais. A pessoa digita "45,90" e o componente
 * devolve 4590 (centavos) em `onChange`, ou null se o texto não for um valor.
 */
export const CampoDinheiro = ({
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  grande = false,
  autoFocus,
  id,
  rotuloAcessivel,
}: ICampoDinheiro) => {
  const valor = value ?? null;
  const [texto, setTexto] = useState(valor != null ? centavosParaTexto(valor) : '');

  // Sincroniza quando o valor muda de fora (ex.: abrir edição).
  const [valorAnterior, setValorAnterior] = useState(valor);
  if (valor !== valorAnterior) {
    setValorAnterior(valor);
    if (valor != null && textoParaCentavos(texto) !== valor) setTexto(centavosParaTexto(valor));
  }

  return (
    <Container className={grande ? 'grande' : 'pequeno'}>
      <span className="moeda">R$</span>
      <input
        id={id}
        name={name}
        ref={inputRef}
        aria-label={rotuloAcessivel}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0,00"
        autoFocus={autoFocus}
        value={texto}
        onBlur={onBlur}
        onChange={(e) => {
          const limpo = e.target.value.replace(/[^\d.,]/g, '');
          setTexto(limpo);
          onChange(textoParaCentavos(limpo));
        }}
      />
    </Container>
  );
};
