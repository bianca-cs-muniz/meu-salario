import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { rotas } from '@constants/rotas';
import { Tipografias } from '@shared/components/tipografias';
import { nomeMes, somarMeses } from '@utils/datas';
import { Container } from './styles';

interface ICabecalho {
  nome?: string;
  competencia: string;
  aoMudarCompetencia: (competencia: string) => void;
}

/** Voltar para Cartões + nome do cartão + navegação entre faturas. */
export const Cabecalho = ({ nome, competencia, aoMudarCompetencia }: ICabecalho) => (
  <Container>
    <Link to={rotas.CARTOES} className="voltar">
      <ChevronLeft size={16} /> Cartões
    </Link>

    <div className="linha">
      <Tipografias.Titulo component="h1" className="titulo">
        {nome ?? 'Fatura'}
      </Tipografias.Titulo>
      <nav aria-label="Fatura">
        <button
          type="button"
          onClick={() => aoMudarCompetencia(somarMeses(competencia, -1))}
          aria-label="Fatura anterior"
          className="seta"
        >
          <ChevronLeft size={18} />
        </button>
        <Tipografias.TituloBloco component="span" className="mes">
          {nomeMes(competencia)}
        </Tipografias.TituloBloco>
        <button
          type="button"
          onClick={() => aoMudarCompetencia(somarMeses(competencia, 1))}
          aria-label="Próxima fatura"
          className="seta"
        >
          <ChevronRight size={18} />
        </button>
      </nav>
    </div>
  </Container>
);
