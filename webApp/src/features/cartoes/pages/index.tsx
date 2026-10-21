import { useState } from 'react';
import type { ICartao } from '@services/tipos';
import { Cabecalho } from '../components/cabecalho';
import { FormularioCartao } from '../components/formulario';
import { Lista } from '../components/lista';
import { Corpo } from './styles';

export const CartoesPagina = () => {
  const [editando, setEditando] = useState<ICartao | 'novo' | null>(null);

  return (
    <Corpo>
      <Cabecalho aoNovo={() => setEditando('novo')} />
      <Lista aoNovo={() => setEditando('novo')} aoEditar={setEditando} />
      {editando && (
        <FormularioCartao cartao={editando === 'novo' ? undefined : editando} aoFechar={() => setEditando(null)} />
      )}
    </Corpo>
  );
};
