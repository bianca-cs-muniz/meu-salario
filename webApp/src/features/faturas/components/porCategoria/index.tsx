import type { ITotalCategoria } from '@services/tipos';
import { BarraProgresso } from '@shared/components/barraProgresso';
import { Bloco } from '@shared/components/bloco';
import { IconeCategoria } from '@shared/components/iconeCategoria';
import { formatarDinheiro, porcentagem } from '@utils/dinheiro';
import { Container } from './styles';

interface IPorCategoria {
  categorias: ITotalCategoria[];
  totalCentavos: number;
}

/** Quanto cada categoria pesa na fatura. Some quando não há categorias. */
export const PorCategoria = ({ categorias, totalCentavos }: IPorCategoria) => {
  if (categorias.length === 0) return null;

  return (
    <Container>
      <Bloco titulo="Por categoria">
        <ul className="lista">
          {categorias.map((c) => (
            <li key={c.categoriaId} className="item">
              <IconeCategoria nome={c.icone} cor={c.cor} tamanho={30} />
              <div className="meio">
                <div className="linha">
                  <span className="nome">{c.nome}</span>
                  <span className="valor">{formatarDinheiro(c.totalCentavos)}</span>
                </div>
                <BarraProgresso valor={porcentagem(c.totalCentavos, totalCentavos)} cor={c.cor} />
              </div>
            </li>
          ))}
        </ul>
      </Bloco>
    </Container>
  );
};
