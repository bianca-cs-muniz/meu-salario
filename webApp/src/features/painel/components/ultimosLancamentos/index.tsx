import { useFormLancamento } from '@contexts/FormLancamentoContext';
import { rotas } from '@constants/rotas';
import { useLancamentosLista } from '@features/lancamentos/hooks/queryes';
import { useCompetencia } from '@hooks/useCompetencia';
import { Bloco } from '@shared/components/bloco';
import { BotaoCustomizado } from '@shared/components/botao';
import { Esqueleto } from '@shared/components/esqueleto';
import { ItemLancamento } from '@shared/components/itemLancamento';
import { Vazio } from '@shared/components/vazio';
import { Lista, VerTodos } from './styles';

/** Os 5 lançamentos mais recentes do mês selecionado. */
export const UltimosLancamentos = () => {
  const { competencia } = useCompetencia();
  const { abrirEdicao, abrirNovoLancamento } = useFormLancamento();
  const { lista, estaCarregando } = useLancamentosLista({ competencia });
  const ultimos = (lista ?? []).slice(0, 5);

  return (
    <Bloco titulo="Últimos lançamentos" acao={<VerTodos to={rotas.LANCAMENTOS}>Ver todos</VerTodos>}>
      {estaCarregando && !lista ? (
        <Esqueleto altura={160} />
      ) : ultimos.length === 0 ? (
        <Vazio
          texto="Nada anotado neste mês."
          acao={
            <BotaoCustomizado.BotaoPrimario onClick={() => abrirNovoLancamento()}>Adicionar gasto</BotaoCustomizado.BotaoPrimario>
          }
        />
      ) : (
        <Lista>
          {ultimos.map((l) => (
            <ItemLancamento key={l.id} lancamento={l} aoClicar={() => abrirEdicao(l)} />
          ))}
        </Lista>
      )}
    </Bloco>
  );
};
