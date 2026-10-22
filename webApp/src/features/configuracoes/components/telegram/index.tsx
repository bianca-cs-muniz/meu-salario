import { Send } from 'lucide-react';
import { Bloco } from '@shared/components/bloco';
import { BotaoCustomizado } from '@shared/components/botao';
import { ErroCarregar } from '@shared/components/erroCarregar';
import { Esqueleto } from '@shared/components/esqueleto';
import { Tipografias } from '@shared/components/tipografias';
import { formatarData } from '@utils/Mascara';
import { useTelegram } from '../../hooks';
import { Container } from './styles';

const EXEMPLOS = [
  { mensagem: 'debito farmacia 2,90', efeito: 'anota no débito' },
  { mensagem: 'pix uber 18,50', efeito: 'anota no Pix' },
  { mensagem: 'credito ifood 45 no nubank', efeito: 'anota no cartão' },
  { mensagem: 'vr mercado 230', efeito: 'anota no VR' },
  { mensagem: 'parcelamento tenis 600 em 3x no nubank', efeito: 'cria as parcelas' },
  { mensagem: 'entrada salario 4500', efeito: 'anota uma entrada (Conta)' },
  { mensagem: 'entrada vr 800', efeito: 'recarga do VR' },
  { mensagem: 'sobra', efeito: 'sobra do mês' },
  { mensagem: 'gasto mercado', efeito: 'gasto da categoria' },
  { mensagem: 'fatura nubank', efeito: 'total e vencimento' },
  { mensagem: 'apaga', efeito: 'desfaz o último anotado pelo Telegram' },
];

export const Telegram = () => {
  const {
    status,
    estaCarregando,
    erro,
    recarregar,
    link,
    handleConectar,
    estaConectando,
    handleDesconectar,
    estaDesconectando,
  } = useTelegram();

  const conteudo = () => {
    if (erro) return <ErroCarregar mensagem={erro} tentar={recarregar} />;
    if (estaCarregando || !status) return <Esqueleto altura={48} />;

    if (!status.disponivel) {
      return <p className="status mudo">O Telegram ainda não foi configurado no servidor.</p>;
    }

    if (status.conectado) {
      return (
        <>
          <p className="status">
            <Send size={18} className="iconeTelegram" />
            <span>
              {status.usuario ? (
                <>
                  Conectado como <strong>@{status.usuario}</strong>
                </>
              ) : (
                'Conectado'
              )}
              {status.conectadoEm && <span className="desde"> desde {formatarData(status.conectadoEm)}</span>}
            </span>
          </p>
          <BotaoCustomizado.BotaoSecundario onClick={handleDesconectar} disabled={estaDesconectando}>
            Desconectar
          </BotaoCustomizado.BotaoSecundario>
        </>
      );
    }

    if (link) {
      return (
        <div className="aguardando">
          <a href={link} target="_blank" rel="noopener noreferrer" className="abrirTelegram">
            <Send size={16} />
            Abrir no Telegram
          </a>
          <Tipografias.LegendaSimples>
            O link vale por 10 minutos. Depois de abrir, toque em Iniciar no Telegram.
          </Tipografias.LegendaSimples>
        </div>
      );
    }

    return (
      <BotaoCustomizado.BotaoSecundario onClick={handleConectar} disabled={estaConectando}>
        Conectar Telegram
      </BotaoCustomizado.BotaoSecundario>
    );
  };

  return (
    <Bloco titulo="Estagiário no Telegram">
      <Container>
        <p className="descricao">Anote gastos mandando mensagem para o bot no Telegram, sem abrir o app.</p>

        {conteudo()}

        <div className="exemplos">
          <p className="tituloExemplos">Exemplos do que mandar</p>
          <Tipografias.LegendaSimples>
            Comece pela forma de pagamento: debito, credito, pix, dinheiro ou vr. Para outro dia, termine com ontem ou
            20/10.
          </Tipografias.LegendaSimples>
          <ul>
            {EXEMPLOS.map((e) => (
              <li key={e.mensagem}>
                <span className="mensagem">{e.mensagem}</span> {e.efeito}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Bloco>
  );
};
