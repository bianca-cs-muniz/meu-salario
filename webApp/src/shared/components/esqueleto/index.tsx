import { Barra } from './styles';

interface IEsqueleto {
  /** Altura em px (ou qualquer valor CSS). */
  altura: number | string;
  largura?: number | string;
}

/** Bloco pulsando enquanto os dados carregam. */
export const Esqueleto = ({ altura, largura = '100%' }: IEsqueleto) => (
  <Barra variant="rectangular" animation="pulse" height={altura} width={largura} />
);
