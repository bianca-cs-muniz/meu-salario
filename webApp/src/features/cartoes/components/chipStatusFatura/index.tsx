import { ROTULO_STATUS_FATURA } from '@constants/rotulos';
import type { StatusFatura } from '@services/tipos';
import { Chip } from './styles';

/** Selo de status da fatura (Aberta, Fechada, Paga, Atrasada). Usado em cartões e na fatura. */
export const ChipStatusFatura = ({ status }: { status: StatusFatura }) => (
  <Chip status={status}>
    {ROTULO_STATUS_FATURA[status]}
  </Chip>
);
