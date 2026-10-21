import type { FC, MouseEvent, ReactNode } from 'react';
import { Modal } from '@mui/material';
import { X } from 'lucide-react';
import { Tipografias } from '../tipografias';
import { Cabecalho, Janela, Posicionador } from './styles';

interface IModalCustomizado {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** `padrao` ≈ max-w-lg; `estreita` ≈ max-w-sm (confirmações). */
  largura?: 'padrao' | 'estreita';
}

export const ModalCustomizado: FC<IModalCustomizado> = ({ open, onClose, title, children, largura = 'padrao' }) => {
  const fecharPeloFundo = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Posicionador onClick={fecharPeloFundo} tabIndex={-1}>
        <Janela role="dialog" aria-modal="true" aria-label={title} className={largura === 'estreita' ? 'estreita' : undefined}>
          <Cabecalho>
            <Tipografias.TituloBloco component="h3">{title}</Tipografias.TituloBloco>
            <button type="button" className="fechar" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          </Cabecalho>
          {children}
        </Janela>
      </Posicionador>
    </Modal>
  );
};
