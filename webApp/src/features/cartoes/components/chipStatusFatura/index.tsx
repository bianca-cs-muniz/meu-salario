import { ROTULO_STATUS_FATURA } from '@constants/rotulos';
import type { StatusFatura } from '@services/tipos';
import { Chip } from './styles';

/**
 * Selo de status da fatura (Aberta, Fechada, Paga, Atrasada). Usado em cartões e na fatura.
 * `sobreCofre`: o selo está sobre o fundo escuro e usa as cores de texto com contraste nele.
 */
export const ChipStatusFatura = ({ status, sobreCofre = false }: { status: StatusFatura; sobreCofre?: boolean }) => (
  <Chip status={status} sobreCofre={sobreCofre}>
    {ROTULO_STATUS_FATURA[status]}
  </Chip>
);
