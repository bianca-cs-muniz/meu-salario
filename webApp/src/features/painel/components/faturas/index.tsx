import { rotasDinamicas } from '@constants/rotas';
import { ROTULO_STATUS_FATURA } from '@constants/rotulos';
import type { IResumo } from '@services/tipos';
import { Bloco } from '@shared/components/bloco';
import { Tipografias } from '@shared/components/tipografias';
import { dataCurta, nomeMesSemAno } from '@utils/datas';
import { formatarDinheiro } from '@utils/dinheiro';
import { Faixa, ItemFatura, Lista } from './styles';

/** Faturas que vencem no mês selecionado. Cada uma leva para a fatura do cartão. */
export const Faturas = ({ resumo: r }: { resumo: IResumo }) => (
  <Bloco titulo={`Faturas de ${nomeMesSemAno(r.competencia)}`}>
    <Lista>
      {r.faturas.map((f) => (
        <li key={`${f.cartaoId}-${f.competencia}`}>
          <ItemFatura to={rotasDinamicas.FATURA(f.cartaoId, f.competencia)}>
            <Faixa cor={f.cartao.cor} />
            <span className="meio">
              <span className="nome">{f.cartao.nome}</span>
              <span className="vencimento">Vence {dataCurta(f.vencimento)}</span>
            </span>
            <span className="direita">
              <Tipografias.Valor component="span" className="total">
                {formatarDinheiro(f.totalCentavos)}
              </Tipografias.Valor>
              <span className={`status status-${f.status}`}>{ROTULO_STATUS_FATURA[f.status]}</span>
            </span>
          </ItemFatura>
        </li>
      ))}
    </Lista>
  </Bloco>
);
