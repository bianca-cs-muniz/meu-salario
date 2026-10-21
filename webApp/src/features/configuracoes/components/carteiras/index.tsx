import { Pencil } from 'lucide-react';
import { Bloco } from '@shared/components/bloco';
import { BotaoCustomizado } from '@shared/components/botao';
import { ErroCarregar } from '@shared/components/erroCarregar';
import { Esqueleto } from '@shared/components/esqueleto';
import { InputCustomizado } from '@shared/components/input';
import { Tipografias } from '@shared/components/tipografias';
import { formatarDinheiro } from '@utils/dinheiro';
import { useEdicaoCarteiras } from '../../hooks';
import { useCarteirasLista } from '../../hooks/queryes';
import { Container } from './styles';

export const Carteiras = () => {
  const { lista, estaCarregando, erro, recarregar } = useCarteirasLista();
  const { editando, nome, setNome, abrirEdicao, handleRenomear, estaRenomeando, criarVr, estaCriando } = useEdicaoCarteiras();

  return (
    <Bloco titulo="Carteiras">
      <Container>
        {erro ? (
          <ErroCarregar mensagem={erro} tentar={recarregar} />
        ) : estaCarregando && !lista ? (
          <Esqueleto altura={96} />
        ) : (
          <ul className="itens">
            {(lista ?? []).map((c) => (
              <li key={c.id} className="item">
                {editando === c.id ? (
                  <form
                    className="renomear"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRenomear(c);
                    }}
                  >
                    <InputCustomizado.InputComum value={nome} onChange={(e) => setNome(e.target.value)} autoFocus aria-label="Nome da carteira" />
                    <BotaoCustomizado.BotaoSecundario type="submit" carregando={estaRenomeando}>
                      Salvar
                    </BotaoCustomizado.BotaoSecundario>
                  </form>
                ) : (
                  <>
                    <span className="meio">
                      <span className="nome">{c.nome}</span>
                      <span className="tipo">{c.tipo === 'VR' ? 'Saldo do VR' : 'Sobra do mês'}</span>
                    </span>
                    <Tipografias.Numero component="span" className="saldo">
                      {formatarDinheiro(c.saldoCentavos)}
                    </Tipografias.Numero>
                    <button type="button" onClick={() => abrirEdicao(c)} aria-label={`Renomear ${c.nome}`} className="editar">
                      <Pencil size={16} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        {lista && !lista.some((c) => c.tipo === 'VR') && (
          <div className="adicionarVr">
            <BotaoCustomizado.BotaoSecundario onClick={criarVr} disabled={estaCriando}>
              Adicionar carteira de VR
            </BotaoCustomizado.BotaoSecundario>
          </div>
        )}
      </Container>
    </Bloco>
  );
};
