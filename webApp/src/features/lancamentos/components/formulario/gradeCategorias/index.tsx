import type { ICategoria } from '@services/tipos';
import { IconeCategoria } from '@shared/components/iconeCategoria';
import { Container } from './styles';

interface IGradeCategorias {
  categorias: ICategoria[];
  categoriaId: string | null;
  aoEscolher: (id: string) => void;
  /** Pagamento no VR: a lista já vem filtrada; muda só o rótulo. */
  soVr: boolean;
}

export const GradeCategorias = ({ categorias, categoriaId, aoEscolher, soVr }: IGradeCategorias) => (
  <Container>
    <legend>Categoria{soVr && ' (só as que aceitam VR)'}</legend>
    <div className="grade">
      {categorias.map((c) => {
        const ativa = c.id === categoriaId;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={ativa}
            onClick={() => aoEscolher(c.id)}
            className={ativa ? 'categoria ativa' : 'categoria'}
          >
            <IconeCategoria nome={c.icone} cor={c.cor} tamanho={30} />
            <span className="nome">{c.nome}</span>
          </button>
        );
      })}
    </div>
  </Container>
);
