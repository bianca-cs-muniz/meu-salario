import { Cabecalho } from '../components/cabecalho';
import { Lista } from '../components/lista';
import { Corpo } from './styles';

export const PendenciasPagina = () => {
  return (
    <Corpo>
      <Cabecalho />
      <Lista />
    </Corpo>
  );
};
