import { useCompetencia } from '@hooks/useCompetencia';
import { ErroCarregar } from '@shared/components/erroCarregar';
import { SeletorMes } from '@shared/components/seletorMes';
import { AvisoPendencias } from '../components/avisoPendencias';
import { PainelCarregando } from '../components/carregando';
import { Categorias } from '../components/categorias';
import { Destaque } from '../components/destaque';
import { Evolucao } from '../components/evolucao';
import { Faturas } from '../components/faturas';
import { Onboarding } from '../components/onboarding';
import { Regra503020 } from '../components/regra503020';
import { UltimosLancamentos } from '../components/ultimosLancamentos';
import { BlocoVr } from '../components/vr';
import { useResumo } from '../hooks/queryes';
import { Corpo } from './styles';

export const PainelPagina = () => {
  const { competencia } = useCompetencia();
  const { resumo: r, erro, recarregar } = useResumo(competencia);

  if (erro) return <ErroCarregar mensagem={erro} tentar={recarregar} />;
  if (!r) return <PainelCarregando />;
  // Sem salário (entrada fixa) cadastrado ainda: primeiro acesso.
  if (!r.temEntradaFixa) return <Onboarding />;

  return (
    <Corpo>
      <div className="topo">
        <SeletorMes />
      </div>

      <Destaque resumo={r} />

      {r.pendencias > 0 && <AvisoPendencias quantidade={r.pendencias} />}

      <div className="colunas">
        <div className="coluna">
          <Categorias resumo={r} />
          <UltimosLancamentos />
        </div>
        <div className="coluna">
          {r.faturas.length > 0 && <Faturas resumo={r} />}
          {r.vr && <BlocoVr vr={r.vr} />}
          <Regra503020 resumo={r} />
        </div>
      </div>

      <Evolucao />
    </Corpo>
  );
};
