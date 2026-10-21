import { TituloPagina } from '@shared/components/tituloPagina';
import { Perfil } from '../components/perfil';
import { Whatsapp } from '../components/whatsapp';
import { Carteiras } from '../components/carteiras';
import { Avisos } from '../components/avisos';
import { Conta } from '../components/conta';
import { Corpo } from './styles';

export const ConfiguracoesPagina = () => (
  <Corpo>
    <TituloPagina>Configurações</TituloPagina>
    <div className="blocos">
      <Perfil />
      <Whatsapp />
      <Carteiras />
      <Avisos />
      <Conta />
    </div>
  </Corpo>
);
