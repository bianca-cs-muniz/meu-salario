import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCompetencia } from '@hooks/useCompetencia';
import { competenciaAtual, nomeMes } from '@utils/datas';
import { Tipografias } from '../tipografias';
import { Container } from './styles';

export const SeletorMes = () => {
  const { competencia, mesAnterior, mesSeguinte, definirCompetencia } = useCompetencia();
  const ehAtual = competencia === competenciaAtual();

  return (
    <Container>
      <nav aria-label="Mês">
        <button type="button" onClick={mesAnterior} aria-label="Mês anterior" className="seta">
          <ChevronLeft size={18} />
        </button>
        <Tipografias.TituloBloco component="span" className="mes">
          {nomeMes(competencia)}
        </Tipografias.TituloBloco>
        <button type="button" onClick={mesSeguinte} aria-label="Próximo mês" className="seta">
          <ChevronRight size={18} />
        </button>
      </nav>
      {!ehAtual && (
        <button type="button" onClick={() => definirCompetencia(competenciaAtual())} className="hoje">
          Voltar para hoje
        </button>
      )}
    </Container>
  );
};
