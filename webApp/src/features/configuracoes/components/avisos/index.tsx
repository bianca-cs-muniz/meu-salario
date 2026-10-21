import { Bloco } from '@shared/components/bloco';
import { InputSwitche } from '@shared/components/switch';
import { useAvisos } from '../../hooks';
import { Container } from './styles';

export const Avisos = () => {
  const { avisos, alternar } = useAvisos();

  return (
    <Bloco titulo="Avisos do estagiário">
      <Container>
        <InputSwitche
          className="interruptor"
          label="Resumo da semana, aos domingos"
          checked={avisos.resumoSemanal}
          handleChange={() => alternar('resumoSemanal')}
        />
        <InputSwitche
          className="interruptor"
          label="Fatura fechando e vencendo"
          checked={avisos.fatura}
          handleChange={() => alternar('fatura')}
        />
      </Container>
    </Bloco>
  );
};
