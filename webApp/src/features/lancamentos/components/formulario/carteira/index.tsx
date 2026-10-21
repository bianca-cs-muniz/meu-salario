import { Controller, type Control } from 'react-hook-form';
import type { ICarteira } from '@services/tipos';
import { InputCustomizado } from '@shared/components/input';
import type { LancamentoForm } from '../../../hooks';
import { Container } from './styles';

interface ICarteiraCampo {
  carteiras: ICarteira[];
  control: Control<LancamentoForm>;
}

/** Onde a entrada caiu (conta ou VR). Só aparece quando há mais de uma carteira. */
export const Carteira = ({ carteiras, control }: ICarteiraCampo) => (
  <Container>
    <Controller
      control={control}
      name="carteiraId"
      render={({ field }) => (
        <InputCustomizado.InputSelecao
          label="Onde entrou"
          name={field.name}
          ref={field.ref}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
        >
          {carteiras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </InputCustomizado.InputSelecao>
      )}
    />
  </Container>
);
