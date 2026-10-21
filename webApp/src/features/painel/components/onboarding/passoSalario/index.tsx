import { Controller } from 'react-hook-form';
import { BotaoCustomizado } from '@shared/components/botao';
import { CampoDinheiro } from '@shared/components/campoDinheiro';
import { InputCustomizado } from '@shared/components/input';
import { MensagemErro } from '@shared/components/mensagemErro';
import { Tipografias } from '@shared/components/tipografias';
import type { IOnboardingEstado } from '../../../hooks';
import { Secao } from './styles';

export const PassoSalario = ({ onboarding }: { onboarding: IOnboardingEstado }) => {
  const { primeiroNome, controlSalario, handleSalvarSalario, salvandoSalario, erro } = onboarding;

  return (
    <Secao component="section">
      <div>
        <Tipografias.Titulo component="h1" className="titulo">
          {primeiroNome ? `${primeiroNome}, quanto` : 'Quanto'} cai na sua conta todo mês?
        </Tipografias.Titulo>
        <Tipografias.Legenda className="explicacao">
          O salário líquido. É a partir dele que o app mostra quanto ainda sobra.
        </Tipografias.Legenda>
      </div>
      <Controller
        control={controlSalario}
        name="valorCentavos"
        render={({ field }) => (
          <CampoDinheiro
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            inputRef={field.ref}
            grande
            autoFocus
            rotuloAcessivel="Salário mensal"
          />
        )}
      />
      <Controller
        control={controlSalario}
        name="dia"
        render={({ field }) => (
          <InputCustomizado.InputComum
            label="Em que dia do mês?"
            inputMode="numeric"
            className="dia"
            name={field.name}
            ref={field.ref}
            value={field.value}
            onBlur={field.onBlur}
            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
          />
        )}
      />
      <MensagemErro texto={erro} />
      <BotaoCustomizado.BotaoPrimario larguraTotal onClick={handleSalvarSalario} carregando={salvandoSalario}>
        Continuar
      </BotaoCustomizado.BotaoPrimario>
    </Secao>
  );
};
