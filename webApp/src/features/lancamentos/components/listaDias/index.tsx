import { useMemo } from 'react';
import { useFormLancamento } from '@contexts/FormLancamentoContext';
import type { IFiltroLancamentos, ILancamento } from '@services/tipos';
import { BotaoCustomizado } from '@shared/components/botao';
import { ErroCarregar } from '@shared/components/erroCarregar';
import { Esqueleto } from '@shared/components/esqueleto';
import { Vazio } from '@shared/components/vazio';
import { chaveDia } from '@utils/datas';
import { useLancamentosLista } from '../../hooks/queryes';
import { GrupoDia } from './grupoDia';
import { Totais } from './totais';
import { Container } from './styles';

interface IListaDias {
  filtro: IFiltroLancamentos;
  temFiltro: boolean;
}

const somar = (itens: ILancamento[], tipo: ILancamento['tipo']) =>
  itens.filter((l) => l.tipo === tipo).reduce((s, l) => s + l.valorCentavos, 0);

/** Agrupa por dia (fuso de São Paulo), do mais recente para o mais antigo. */
const agruparPorDia = (itens: ILancamento[]) => {
  const mapa = new Map<string, ILancamento[]>();
  [...itens]
    .sort((a, b) => b.data.localeCompare(a.data))
    .forEach((l) => {
      const dia = chaveDia(l.data);
      mapa.set(dia, [...(mapa.get(dia) ?? []), l]);
    });
  return [...mapa.entries()].map(([dia, lista]) => ({ dia, itens: lista, saidas: somar(lista, 'SAIDA') }));
};

export const ListaDias = ({ filtro, temFiltro }: IListaDias) => {
  const { abrirNovoLancamento } = useFormLancamento();
  const { lista, estaCarregando, erro, recarregar } = useLancamentosLista(filtro);

  const grupos = useMemo(() => agruparPorDia(lista ?? []), [lista]);
  const totais = useMemo(
    () => ({ entradas: somar(lista ?? [], 'ENTRADA'), saidas: somar(lista ?? [], 'SAIDA') }),
    [lista],
  );

  if (erro) return <ErroCarregar mensagem={erro} tentar={recarregar} />;

  if (estaCarregando && !lista) {
    return (
      <Container>
        <div className="grupos estreito">
          <Esqueleto altura={56} />
          <Esqueleto altura={56} />
          <Esqueleto altura={56} />
        </div>
      </Container>
    );
  }

  if (grupos.length === 0) {
    return (
      <Vazio
        texto={temFiltro ? 'Nenhum lançamento com esses filtros.' : 'Nada anotado neste mês.'}
        acao={
          !temFiltro && (
            <BotaoCustomizado.BotaoPrimario onClick={() => abrirNovoLancamento()}>Adicionar gasto</BotaoCustomizado.BotaoPrimario>
          )
        }
      />
    );
  }

  return (
    <Container>
      <div className="grupos">
        {grupos.map((g) => (
          <GrupoDia key={g.dia} itens={g.itens} saidas={g.saidas} />
        ))}
      </div>
      <Totais entradas={totais.entradas} saidas={totais.saidas} />
    </Container>
  );
};
