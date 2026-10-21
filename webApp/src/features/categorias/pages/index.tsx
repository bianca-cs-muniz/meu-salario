import { useState } from 'react';
import type { ICategoria } from '@services/tipos';
import { Cabecalho } from '../components/cabecalho';
import { Filtros } from '../components/filtros';
import { Lista } from '../components/lista';
import { FormularioCategoria } from '../components/formulario';
import { Corpo } from './styles';

export const CategoriasPagina = () => {
  const [editando, setEditando] = useState<ICategoria | 'nova' | null>(null);

  return (
    <Corpo>
      <Cabecalho aoNova={() => setEditando('nova')} />
      <Filtros />
      <Lista aoAbrir={setEditando} />
      {editando && (
        <FormularioCategoria categoria={editando === 'nova' ? undefined : editando} aoFechar={() => setEditando(null)} />
      )}
    </Corpo>
  );
};
