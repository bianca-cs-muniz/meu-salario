import type { IResumo } from '@services/tipos';
import { Bloco } from '@shared/components/bloco';
import { Tipografias } from '@shared/components/tipografias';
import { formatarDinheiro } from '@utils/dinheiro';
import { Conteudo } from './styles';

/** Saldo do VR e o que entrou/saiu dele no mês. */
export const BlocoVr = ({ vr }: { vr: NonNullable<IResumo['vr']> }) => (
  <Bloco titulo="VR">
    <Conteudo>
      <Tipografias.Valor className="saldo">{formatarDinheiro(vr.saldoCentavos)}</Tipografias.Valor>
      <Tipografias.LegendaSimples>de saldo disponível</Tipografias.LegendaSimples>
      <div className="movimento">
        <span>
          <span className="rotulo">Entrou </span>
          <Tipografias.Numero component="span" className="entrou">
            {formatarDinheiro(vr.entradasMesCentavos)}
          </Tipografias.Numero>
        </span>
        <span>
          <span className="rotulo">Saiu </span>
          <Tipografias.Numero component="span" className="saiu">
            {formatarDinheiro(vr.saidasMesCentavos)}
          </Tipografias.Numero>
        </span>
      </div>
    </Conteudo>
  </Bloco>
);
