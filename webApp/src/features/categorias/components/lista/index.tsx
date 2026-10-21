import { useState } from 'react';
import { ROTULO_GRUPO } from '@constants/rotulos';
import { useCompetencia } from '@hooks/useCompetencia';
import type { ICategoria } from '@services/tipos';
import { Bloco } from '@shared/components/bloco';
import { ErroCarregar } from '@shared/components/erroCarregar';
import { Esqueleto } from '@shared/components/esqueleto';
import { GRUPOS } from '../../cores';
import { useCategoriasLista } from '../../hooks/queryes';
import { ItemCategoria } from './itemCategoria';
import { Container } from './styles';

interface ILista {
  aoAbrir: (categoria: ICategoria) => void;
}

export const Lista = ({ aoAbrir }: ILista) => {
  const { competencia } = useCompetencia();
  const { lista, estaCarregando, erro, recarregar } = useCategoriasLista(competencia);
  const [mostrarInativas, setMostrarInativas] = useState(false);

  if (erro) return <ErroCarregar mensagem={erro} tentar={recarregar} />;
  if (estaCarregando && !lista) return <Esqueleto altura={384} />;

  const todas = lista ?? [];
  const visiveis = todas.filter((c) => mostrarInativas || c.ativa);

  return (
    <Container>
      {GRUPOS.map((g) => {
        const doGrupo = visiveis.filter((c) => c.grupo === g);
        if (!doGrupo.length) return null;
        return (
          <Bloco key={g} titulo={ROTULO_GRUPO[g]} className="grupo">
            <ul className="itens">
              {doGrupo.map((c) => (
                <ItemCategoria key={c.id} categoria={c} aoClicar={() => aoAbrir(c)} />
              ))}
            </ul>
          </Bloco>
        );
      })}
      {todas.some((c) => !c.ativa) && (
        <button type="button" onClick={() => setMostrarInativas((v) => !v)} className="alternarInativas">
          {mostrarInativas ? 'Esconder desativadas' : 'Mostrar desativadas'}
        </button>
      )}
    </Container>
  );
};
