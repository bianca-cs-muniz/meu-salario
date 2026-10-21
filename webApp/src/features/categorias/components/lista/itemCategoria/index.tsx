import type { ICategoria } from '@services/tipos';
import { BarraProgresso } from '@shared/components/barraProgresso';
import { IconeCategoria } from '@shared/components/iconeCategoria';
import { formatarDinheiro, porcentagem } from '@utils/dinheiro';
import { Item } from './styles';

interface IItemCategoria {
  categoria: ICategoria;
  aoClicar: () => void;
}

/** Categoria com o gasto do mês e, se tiver limite, a barra de progresso. */
export const ItemCategoria = ({ categoria: c, aoClicar }: IItemCategoria) => {
  const passou = !!c.limiteMensalCentavos && c.gastoCentavos > c.limiteMensalCentavos;

  return (
    <Item>
      <button type="button" onClick={aoClicar} className={c.ativa ? 'botao' : 'botao inativa'}>
        <IconeCategoria nome={c.icone} cor={c.cor} />
        <span className="meio">
          <span className="linha">
            <span className="nome">
              {c.nome}
              {c.aceitaVr && <span className="vr">VR</span>}
            </span>
            <span className={passou ? 'gasto passou' : 'gasto'}>{formatarDinheiro(c.gastoCentavos)}</span>
          </span>
          {c.limiteMensalCentavos ? (
            <span className="limite">
              <BarraProgresso valor={porcentagem(c.gastoCentavos, c.limiteMensalCentavos)} cor={c.cor} alerta={passou} />
              <span className="textoLimite">limite {formatarDinheiro(c.limiteMensalCentavos)}</span>
            </span>
          ) : null}
        </span>
      </button>
    </Item>
  );
};
