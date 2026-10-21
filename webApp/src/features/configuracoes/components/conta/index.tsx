import useAuth from '@contexts/AuthContext';
import { useMeuPerfil } from '@hooks/useMeuPerfil';
import { Bloco } from '@shared/components/bloco';
import { BotaoCustomizado } from '@shared/components/botao';
import { Tipografias } from '@shared/components/tipografias';
import { Container } from './styles';

export const Conta = () => {
  const { usuario } = useMeuPerfil();
  const { signOutHandler } = useAuth();

  return (
    <Bloco titulo="Conta">
      <Container>
        <Tipografias.LegendaSimples className="conectado">Conectado como {usuario?.email}.</Tipografias.LegendaSimples>
        <BotaoCustomizado.BotaoSecundario onClick={signOutHandler}>Sair</BotaoCustomizado.BotaoSecundario>
      </Container>
    </Bloco>
  );
};
