import { ROTULO_FORMA } from '@constants/rotulos';
import type { IRecorrencia, TipoLancamento } from '@services/tipos';
import { Bloco } from '@shared/components/bloco';
import { BotaoCustomizado } from '@shared/components/botao';
import { IconeCategoria } from '@shared/components/iconeCategoria';
import { COR_CATEGORIA_PADRAO, COR_ENTRADA } from '@shared/components/iconeCategoria/icones';
import { Tipografias } from '@shared/components/tipografias';
import { Vazio } from '@shared/components/vazio';
import { formatarDinheiro } from '@utils/dinheiro';
import { Container } from './styles';

interface IGrupoFixos {
  titulo: string;
  itens: IRecorrencia[];
  entrada: boolean;
  aoAbrir: (alvo: IRecorrencia | TipoLancamento) => void;
}

/** Uma seção da tela (entradas, fixos da casa, fixos no cartão) com o total por mês. */
export const GrupoFixos = ({ titulo, itens, entrada, aoAbrir }: IGrupoFixos) => {
  const total = itens.reduce((t, r) => t + r.valorCentavos, 0);

  return (
    <Container>
      <Bloco
        titulo={titulo}
        acao={
          itens.length > 0 && (
            <Tipografias.Numero component="span" className={entrada ? 'total entrada' : 'total'}>
              {formatarDinheiro(total)}/mês
            </Tipografias.Numero>
          )
        }
      >
        {itens.length === 0 ? (
          <Vazio
            texto={entrada ? 'Nenhuma entrada fixa.' : 'Nenhum gasto fixo aqui ainda.'}
            acao={
              <BotaoCustomizado.BotaoSecundario onClick={() => aoAbrir(entrada ? 'ENTRADA' : 'SAIDA')}>
                Adicionar
              </BotaoCustomizado.BotaoSecundario>
            }
          />
        ) : (
          <ul className="itens">
            {itens.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => aoAbrir(r)} className="botao">
                  <IconeCategoria
                    nome={r.categoria?.icone ?? 'wallet'}
                    cor={r.categoria?.cor ?? (r.tipo === 'ENTRADA' ? COR_ENTRADA : COR_CATEGORIA_PADRAO)}
                  />
                  <span className="meio">
                    <span className="descricao">{r.descricao}</span>
                    <span className="detalhes">
                      Dia {r.diaDoMes} · {r.cartao?.nome ?? ROTULO_FORMA[r.formaPagamento]}
                      {r.categoria && ` · ${r.categoria.nome}`}
                    </span>
                  </span>
                  <Tipografias.Numero component="span" className={r.tipo === 'ENTRADA' ? 'valor entrada' : 'valor'}>
                    {formatarDinheiro(r.valorCentavos)}
                  </Tipografias.Numero>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Bloco>
    </Container>
  );
};
