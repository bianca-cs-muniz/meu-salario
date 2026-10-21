import { useParams } from 'react-router-dom';
import useQueryParams from '@hooks/useQueryParams';
import { ErroCarregar } from '@shared/components/erroCarregar';
import { Esqueleto } from '@shared/components/esqueleto';
import { Vazio } from '@shared/components/vazio';
import { competenciaAtual, nomeMesSemAno } from '@utils/datas';
import { Cabecalho } from '../components/cabecalho';
import { Destaque } from '../components/destaque';
import { GrupoFatura } from '../components/grupoFatura';
import { PorCategoria } from '../components/porCategoria';
import { Proximas } from '../components/proximas';
import { useFatura } from '../hooks/queryes';
import { Colunas, Conteudo, Corpo, Esqueletos } from './styles';

/** Fatura de um cartão (rota `/cartoes/:id?competencia=AAAA-MM`). */
export const FaturaPagina = () => {
  const { id = '' } = useParams();
  const { getParam, setParam } = useQueryParams();
  const competencia = getParam('competencia') ?? competenciaAtual();
  const mudarCompetencia = (c: string) => setParam('competencia', c);

  const { fatura: f, estaCarregando, erro, recarregar } = useFatura(id, competencia);

  const conteudo = () => {
    if (erro) return <ErroCarregar mensagem={erro} tentar={recarregar} />;

    if (!f || (estaCarregando && f.competencia !== competencia)) {
      return (
        <Esqueletos>
          <Esqueleto altura={144} />
          <Esqueleto altura={256} />
        </Esqueletos>
      );
    }

    const semCompras = f.totalCentavos === 0 && f.fixos.length + f.parcelas.length + f.avulsos.length === 0;

    return (
      <Conteudo>
        <Destaque fatura={f} />
        {semCompras ? (
          <Vazio texto={`Nenhuma compra na fatura de ${nomeMesSemAno(competencia)}.`} />
        ) : (
          <Colunas>
            <div className="coluna">
              <GrupoFatura titulo="Fixos do cartão" itens={f.fixos} />
              <GrupoFatura titulo="Parcelas" itens={f.parcelas} />
              <GrupoFatura titulo="Avulsos" itens={f.avulsos} />
            </div>
            <div className="coluna">
              <PorCategoria categorias={f.porCategoria} totalCentavos={f.totalCentavos} />
              <Proximas proximas={f.proximas} aoEscolher={mudarCompetencia} />
            </div>
          </Colunas>
        )}
      </Conteudo>
    );
  };

  return (
    <Corpo>
      <Cabecalho nome={f?.cartao.nome} competencia={competencia} aoMudarCompetencia={mudarCompetencia} />
      {conteudo()}
    </Corpo>
  );
};
