import { SeletorMes } from '@shared/components/seletorMes';
import { TituloPagina } from '@shared/components/tituloPagina';
import { Filtros } from '../components/filtros';
import { ListaDias } from '../components/listaDias';
import { useFiltrosLancamentos } from '../hooks/lista';
import { Corpo } from './styles';

export const LancamentosPagina = () => {
  const filtros = useFiltrosLancamentos();

  return (
    <Corpo>
      <TituloPagina lado={<SeletorMes />}>Lançamentos</TituloPagina>
      <Filtros filtros={filtros} />
      <ListaDias filtro={filtros.filtroCompleto} temFiltro={filtros.temFiltro} />
    </Corpo>
  );
};
