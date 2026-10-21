import { Tipografias } from '@shared/components/tipografias';
import { useOnboarding } from '../../hooks';
import { PassoCartao } from './passoCartao';
import { PassoSalario } from './passoSalario';
import { PassoVr } from './passoVr';
import { Container } from './styles';

/** Primeiro acesso: aparece no lugar do painel enquanto não há salário (entrada fixa) cadastrado. */
export const Onboarding = () => {
  const onboarding = useOnboarding();
  const { passo, indice, passos } = onboarding;

  return (
    <Container>
      <Tipografias.LegendaSimples className="contador">Passo {indice + 1} de 3</Tipografias.LegendaSimples>
      <div className="progresso" aria-hidden>
        {passos.map((p, i) => (
          <span key={p} className={i <= indice ? 'feito' : undefined} />
        ))}
      </div>

      {passo === 'salario' && <PassoSalario onboarding={onboarding} />}
      {passo === 'vr' && <PassoVr onboarding={onboarding} />}
      {passo === 'cartao' && <PassoCartao onboarding={onboarding} />}
    </Container>
  );
};
