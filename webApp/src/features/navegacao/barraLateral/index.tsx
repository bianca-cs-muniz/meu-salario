import { Link } from 'react-router-dom';
import { LogOut, Plus } from 'lucide-react';
import useAuth from '@contexts/AuthContext';
import { useFormLancamento } from '@contexts/FormLancamentoContext';
import { useRotas } from '@hooks/useRotas';
import { Tipografias } from '@shared/components/tipografias';
import { ItemNavegacao } from '../itemNavegacao';
import { PRINCIPAIS, SECUNDARIOS } from '../itens';
import { Container } from './styles';

/** Desktop: barra lateral ameixa com todos os itens. */
export const BarraLateral = () => {
  const { rotas, isRotaAtiva } = useRotas();
  const { abrirNovoLancamento } = useFormLancamento();
  const { signOutHandler } = useAuth();

  return (
    <Container component="aside">
      <Link to={rotas.PAINEL} className="logo">
        <Tipografias.Marca component="span" className="logo-texto">
          Meu Salário
          <span className="traco" />
        </Tipografias.Marca>
      </Link>
      <button type="button" onClick={() => abrirNovoLancamento()} className="novo">
        <Plus size={17} strokeWidth={1.75} /> Novo lançamento
      </button>
      <nav>
        {[...PRINCIPAIS, ...SECUNDARIOS].map((i) => (
          <ItemNavegacao key={i.rota} item={i} ativo={isRotaAtiva(i.rota)} escuro />
        ))}
      </nav>
      <button type="button" onClick={signOutHandler} className="sair">
        <LogOut size={17} strokeWidth={1.6} /> Sair
      </button>
    </Container>
  );
};
