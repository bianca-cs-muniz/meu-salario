import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { ROTULO_FORMA } from '@constants/rotulos';
import type { FormaPagamento, OrigemLancamento } from '@services/tipos';
import { useCartoesLista } from '@features/cartoes/hooks/queryes';
import { useCategoriasLista } from '@features/categorias/hooks/queryes';
import type { IFiltrosLancamentos } from '../../hooks/lista';
import { Container } from './styles';

interface IFiltroSelect {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  children: ReactNode;
}

/** Select em formato de pílula; a primeira opção (vazia) mostra o nome do filtro. */
const FiltroSelect = ({ rotulo, valor, aoMudar, children }: IFiltroSelect) => (
  <select
    aria-label={rotulo}
    value={valor}
    onChange={(e) => aoMudar(e.target.value)}
    className={valor ? 'pilula ativa' : 'pilula'}
  >
    <option value="">{rotulo}</option>
    {children}
  </select>
);

export const Filtros = ({ filtros }: { filtros: IFiltrosLancamentos }) => {
  const { busca, setBusca, filtro, mudar, limpar, temFiltro } = filtros;
  const { lista: categorias = [] } = useCategoriasLista();
  const { lista: cartoes = [] } = useCartoesLista();
  const soRevisar = filtro.revisado === false;

  return (
    <Container>
      <label className="busca">
        <Search size={18} className="icone" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por descrição"
          aria-label="Buscar por descrição"
        />
      </label>
      <div className="linha">
        <FiltroSelect rotulo="Categoria" valor={filtro.categoriaId ?? ''} aoMudar={(v) => mudar('categoriaId', v)}>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </FiltroSelect>
        <FiltroSelect
          rotulo="Pagamento"
          valor={filtro.formaPagamento ?? ''}
          aoMudar={(v) => mudar('formaPagamento', v as FormaPagamento)}
        >
          {(Object.keys(ROTULO_FORMA) as FormaPagamento[]).map((f) => (
            <option key={f} value={f}>
              {ROTULO_FORMA[f]}
            </option>
          ))}
        </FiltroSelect>
        {cartoes.length > 0 && (
          <FiltroSelect rotulo="Cartão" valor={filtro.cartaoId ?? ''} aoMudar={(v) => mudar('cartaoId', v)}>
            {cartoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </FiltroSelect>
        )}
        <FiltroSelect rotulo="Origem" valor={filtro.origem ?? ''} aoMudar={(v) => mudar('origem', v as OrigemLancamento)}>
          <option value="APP">App</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="RECORRENCIA">Gastos fixos</option>
        </FiltroSelect>
        <button
          type="button"
          onClick={() => mudar('revisado', soRevisar ? '' : false)}
          aria-pressed={soRevisar}
          className={soRevisar ? 'pilula revisar ativo' : 'pilula revisar'}
        >
          Só para revisar
        </button>
        {temFiltro && (
          <button type="button" onClick={limpar} className="limpar">
            Limpar filtros
          </button>
        )}
      </div>
    </Container>
  );
};
