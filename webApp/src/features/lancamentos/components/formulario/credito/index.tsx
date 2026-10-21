import { Controller, type Control } from 'react-hook-form';
import type { ICartao } from '@services/tipos';
import { InputCustomizado } from '@shared/components/input';
import { formatarDinheiro } from '@utils/dinheiro';
import { dataCurta, nomeMesSemAno } from '@utils/datas';
import type { LancamentoForm } from '../../../hooks';
import { Container } from './styles';

interface ICredito {
  cartoes: ICartao[];
  editando: boolean;
  valor: number | null;
  cartaoEscolhido?: ICartao;
  dataEhHoje: boolean;
  control: Control<LancamentoForm>;
}

/** Cartão, parcelas e em que fatura a compra cai. */
export const Credito = ({ cartoes, editando, valor, cartaoEscolhido, dataEhHoje, control }: ICredito) => (
  <Container className={cartoes.length > 1 && !editando ? 'duasColunas' : undefined}>
    {cartoes.length > 1 && (
      <Controller
        control={control}
        name="cartaoId"
        render={({ field }) => (
          <InputCustomizado.InputSelecao
            label="Cartão"
            name={field.name}
            ref={field.ref}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
          >
            {cartoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </InputCustomizado.InputSelecao>
        )}
      />
    )}
    {!editando && (
      <Controller
        control={control}
        name="parcelas"
        render={({ field }) => (
          <InputCustomizado.InputSelecao
            label="Parcelas"
            name={field.name}
            ref={field.ref}
            value={field.value}
            onChange={(e) => field.onChange(Number(e.target.value))}
            onBlur={field.onBlur}
          >
            {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? 'À vista' : `${n}x${valor ? ` de ${formatarDinheiro(Math.floor(valor / n))}` : ''}`}
              </option>
            ))}
          </InputCustomizado.InputSelecao>
        )}
      />
    )}
    {cartaoEscolhido && !editando && (
      <p className="fatura">
        {dataEhHoje ? (
          <>
            Cai na fatura de <strong>{nomeMesSemAno(cartaoEscolhido.proximaCompetencia)}</strong>{' '}
            (vence {dataCurta(cartaoEscolhido.proximoVencimento)}).
          </>
        ) : (
          'A fatura é definida pela data da compra.'
        )}
      </p>
    )}
  </Container>
);
