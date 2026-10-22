import { TituloPagina } from '@shared/components/tituloPagina';
import { Perfil } from '../components/perfil';
import { Telegram } from '../components/telegram';
import { Carteiras } from '../components/carteiras';
import { Avisos } from '../components/avisos';
import { Conta } from '../components/conta';
import { Corpo } from './styles';

export const ConfiguracoesPagina = () => (
  <Corpo>
    <TituloPagina>Configurações</TituloPagina>
    <div className="blocos">
      <Perfil />
      <Telegram />
      <Carteiras />
      <Avisos />
      <Conta />
    </div>
  </Corpo>
);
