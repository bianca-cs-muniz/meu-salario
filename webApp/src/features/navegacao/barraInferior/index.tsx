import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ellipsis, Plus } from 'lucide-react';
import { useFormLancamento } from '@contexts/FormLancamentoContext';
import { useRotas } from '@hooks/useRotas';
import { MenuMais } from '../menuMais';
import { PRINCIPAIS, SECUNDARIOS, type IItemNavegacao } from '../itens';
import { Container } from './styles';

const Aba = ({ item, ativo }: { item: IItemNavegacao; ativo: boolean }) => {
  const Icone = item.icone;
  return (
    <Link to={item.rota} aria-current={ativo ? 'page' : undefined} className={ativo ? 'aba ativa' : 'aba'}>
      {ativo && <span aria-hidden className="marcador" />}
      <Icone size={21} strokeWidth={1.6} />
      {item.texto}
    </Link>
  );
};

/** Celular: Painel, Lançamentos, botão +, Cartões e Mais. */
export const BarraInferior = () => {
  const { isRotaAtiva } = useRotas();
  const { abrirNovoLancamento } = useFormLancamento();
  const [maisAberto, setMaisAberto] = useState(false);
  const algumSecundarioAtivo = SECUNDARIOS.some((i) => isRotaAtiva(i.rota));

  return (
    <>
      <Container component="nav" aria-label="Principal">
        {PRINCIPAIS.slice(0, 2).map((i) => (
          <Aba key={i.rota} item={i} ativo={isRotaAtiva(i.rota)} />
        ))}
        <div className="centro">
          <button type="button" onClick={() => abrirNovoLancamento()} aria-label="Novo lançamento" className="mais">
            <Plus size={24} strokeWidth={1.6} />
          </button>
        </div>
        <Aba item={PRINCIPAIS[2]} ativo={isRotaAtiva(PRINCIPAIS[2].rota)} />
        <button
          type="button"
          onClick={() => setMaisAberto(true)}
          className={algumSecundarioAtivo ? 'aba ativa' : 'aba'}
        >
          <Ellipsis size={21} strokeWidth={1.6} />
          Mais
        </button>
      </Container>

      <MenuMais aberto={maisAberto} aoFechar={() => setMaisAberto(false)} />
    </>
  );
};
