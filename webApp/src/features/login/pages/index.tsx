import { Link } from 'react-router-dom';
import { rotas } from '@constants/rotas';
import { TelaPublica } from '@shared/components/telaPublica';
import { FormularioLogin } from '../components/formulario';
import { Convite } from './styles';

export const LoginPagina = () => {
  return (
    <TelaPublica titulo="Entrar" subtitulo="Veja quanto do salário ainda sobra este mês.">
      <FormularioLogin />
      <Convite component="p">
        Ainda não tem conta?{' '}
        <Link to={rotas.REGISTRAR}>Criar conta</Link>
      </Convite>
    </TelaPublica>
  );
};
