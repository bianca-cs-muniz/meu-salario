import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { rotasDinamicas } from '@constants/rotas';
import type { ICartao } from '@services/tipos';
import { BarraProgresso } from '@shared/components/barraProgresso';
import { Tipografias } from '@shared/components/tipografias';
import { formatarDinheiro, porcentagem } from '@utils/dinheiro';
import { dataCurta, nomeMesSemAno } from '@utils/datas';
import { ChipStatusFatura } from '../../chipStatusFatura';
import { Card } from './styles';

interface ICardCartao {
  cartao: ICartao;
  aoEditar: () => void;
}

export const CardCartao = ({ cartao: c, aoEditar }: ICardCartao) => (
  <Card>
    <Link to={rotasDinamicas.FATURA(c.id)} className="link">
      {/* A face do cartão, na cor dele */}
      <div className="face" style={{ background: c.cor }}>
        <span aria-hidden className="brilho" />
        <span aria-hidden className="sombra" />
        <Tipografias.Titulo component="p" className="nome">
          {c.nome}
        </Tipografias.Titulo>
        <div className="rodapeFace">
          <span>
            Fecha dia {c.diaFechamento}
            <br />
            Vence dia {c.diaVencimento}
          </span>
          <span aria-hidden className="chip" />
        </div>
      </div>

      <div className="info">
        {c.faturaAtual ? (
          <div className="fatura">
            <div>
              <Tipografias.LegendaSimples>Fatura de {nomeMesSemAno(c.faturaAtual.competencia)}</Tipografias.LegendaSimples>
              <Tipografias.Valor className="total">{formatarDinheiro(c.faturaAtual.totalCentavos)}</Tipografias.Valor>
            </div>
            <div className="status">
              <ChipStatusFatura status={c.faturaAtual.status} />
              <Tipografias.LegendaSimples className="vence">Vence {dataCurta(c.faturaAtual.vencimento)}</Tipografias.LegendaSimples>
            </div>
          </div>
        ) : (
          <Tipografias.Legenda>Sem fatura em aberto.</Tipografias.Legenda>
        )}

        {c.limiteCentavos ? (
          <div className="limite">
            <div className="linhaLimite">
              <span>Limite usado</span>
              <span className="numero">
                {formatarDinheiro(c.limiteUsadoCentavos)} de {formatarDinheiro(c.limiteCentavos)}
              </span>
            </div>
            <BarraProgresso valor={porcentagem(c.limiteUsadoCentavos, c.limiteCentavos)} cor={c.cor} />
          </div>
        ) : null}
      </div>
    </Link>

    <button type="button" onClick={aoEditar} aria-label={`Editar ${c.nome}`} className="editar">
      <Pencil size={15} strokeWidth={1.6} />
    </button>
  </Card>
);
