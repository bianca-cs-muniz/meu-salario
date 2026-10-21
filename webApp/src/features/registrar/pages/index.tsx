import { Link } from 'react-router-dom';
import { rotas } from '@constants/rotas';
import { TelaPublica } from '@shared/components/telaPublica';
import { FormularioRegistrar } from '../components/formulario';
import { Convite } from './styles';

export const RegistrarPagina = () => {
  return (
    <TelaPublica titulo="Criar conta" subtitulo="Depois você informa o salário e começa a anotar.">
      <FormularioRegistrar />
      <Convite component="p">
        Já tem conta?{' '}
        <Link to={rotas.LOGIN}>Entrar</Link>
      </Convite>
    </TelaPublica>
  );
};
