import { LogOut } from 'lucide-react';
import useAuth from '@contexts/AuthContext';
import { useRotas } from '@hooks/useRotas';
import { ModalCustomizado } from '@shared/components/modal';
import { ItemNavegacao } from '../itemNavegacao';
import { SECUNDARIOS } from '../itens';
import { Container } from './styles';

interface IMenuMais {
  aberto: boolean;
  aoFechar: () => void;
}

/** Celular: Pendências, Gastos fixos, Categorias, Configurações e Sair. */
export const MenuMais = ({ aberto, aoFechar }: IMenuMais) => {
  const { isRotaAtiva } = useRotas();
  const { signOutHandler } = useAuth();

  return (
    <ModalCustomizado open={aberto} onClose={aoFechar} title="Mais">
      <Container component="nav" onClick={aoFechar}>
        {SECUNDARIOS.map((i) => (
          <ItemNavegacao key={i.rota} item={i} ativo={isRotaAtiva(i.rota)} />
        ))}
        <button type="button" onClick={signOutHandler} className="sair">
          <LogOut size={19} strokeWidth={1.6} /> Sair
        </button>
      </Container>
    </ModalCustomizado>
  );
};
