import { useMemo, useState } from 'react';
import { useCompetencia } from '@hooks/useCompetencia';
import { useDebounce } from '@hooks/useDebounce';
import type { IFiltroLancamentos } from '@services/tipos';

/** Filtros escolhidos na tela (a competência vem do seletor de mês e a busca do campo de texto). */
export type IFiltroTela = Omit<IFiltroLancamentos, 'competencia' | 'busca'>;

/** Estado dos filtros da tela de Lançamentos. A busca só é aplicada quando a pessoa para de digitar. */
export const useFiltrosLancamentos = () => {
  const { competencia } = useCompetencia();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<IFiltroTela>({});
  const buscaAplicada: string = useDebounce(busca, 350).trim();

  const temFiltro = Object.values(filtro).some((v) => v !== undefined) || !!buscaAplicada;

  const mudar = <K extends keyof IFiltroTela>(chave: K, valor: IFiltroTela[K] | '') =>
    setFiltro((f) => ({ ...f, [chave]: valor === '' ? undefined : valor }));

  const limpar = () => {
    setFiltro({});
    setBusca('');
  };

  const filtroCompleto = useMemo<IFiltroLancamentos>(
    () => ({ competencia, busca: buscaAplicada || undefined, ...filtro }),
    [competencia, buscaAplicada, filtro],
  );

  return { busca, setBusca, filtro, mudar, limpar, temFiltro, filtroCompleto };
};

export type IFiltrosLancamentos = ReturnType<typeof useFiltrosLancamentos>;
