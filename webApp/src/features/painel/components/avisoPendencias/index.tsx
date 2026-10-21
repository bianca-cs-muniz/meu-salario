import { Inbox } from 'lucide-react';
import { rotas } from '@constants/rotas';
import { Aviso } from './styles';

/** Link para Pendências quando o estagiário deixou lançamentos sem revisar. */
export const AvisoPendencias = ({ quantidade }: { quantidade: number }) => (
  <Aviso to={rotas.PENDENCIAS}>
    <Inbox size={19} strokeWidth={1.6} className="icone" />
    <span className="texto">
      O estagiário deixou {quantidade} {quantidade === 1 ? 'lançamento' : 'lançamentos'} para você revisar
    </span>
  </Aviso>
);
