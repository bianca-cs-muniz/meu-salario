import type { IItemNavegacao } from '../itens';
import { LinkNavegacao } from './styles';

interface IItemNavegacaoProps {
  item: IItemNavegacao;
  ativo: boolean;
  /** Barra lateral (fundo ameixa). */
  escuro?: boolean;
}

export const ItemNavegacao = ({ item, ativo, escuro = false }: IItemNavegacaoProps) => {
  const Icone = item.icone;
  const classes = [escuro ? 'escuro' : '', ativo ? 'ativo' : ''].filter(Boolean).join(' ');

  return (
    <LinkNavegacao to={item.rota} aria-current={ativo ? 'page' : undefined} className={classes || undefined}>
      {ativo && escuro && <span aria-hidden className="marcador" />}
      <Icone size={19} strokeWidth={1.6} /> {item.texto}
    </LinkNavegacao>
  );
};
