import { useState } from 'react';
import type { IRecorrencia, TipoLancamento } from '@services/tipos';
import { Cabecalho } from '../components/cabecalho';
import { Lista } from '../components/lista';
import { FormularioFixo } from '../components/formulario';
import { Corpo } from './styles';

export const FixosPagina = () => {
  // Um tipo (novo fixo daquele tipo) ou o fixo que está sendo editado.
  const [editando, setEditando] = useState<IRecorrencia | TipoLancamento | null>(null);

  return (
    <Corpo>
      <Cabecalho aoNovo={() => setEditando('SAIDA')} />
      <Lista aoAbrir={setEditando} />
      {editando && (
        <FormularioFixo
          recorrencia={typeof editando === 'string' ? undefined : editando}
          tipoInicial={typeof editando === 'string' ? editando : editando.tipo}
          aoFechar={() => setEditando(null)}
        />
      )}
    </Corpo>
  );
};
