import { Controller } from 'react-hook-form';
import { BotaoCustomizado } from '@shared/components/botao';
import { CampoDinheiro } from '@shared/components/campoDinheiro';
import { InputCustomizado } from '@shared/components/input';
import { MensagemErro } from '@shared/components/mensagemErro';
import { Tipografias } from '@shared/components/tipografias';
import type { IOnboardingEstado } from '../../../hooks';
import { Secao } from './styles';

export const PassoVr = ({ onboarding }: { onboarding: IOnboardingEstado }) => {
  const { controlVr, handleSalvarVr, pularVr, salvando, erro } = onboarding;

  return (
    <Secao component="section">
      <div>
        <Tipografias.Titulo component="h1" className="titulo">
          Você recebe vale-refeição ou alimentação?
        </Tipografias.Titulo>
        <Tipografias.Legenda className="explicacao">
          O VR fica com saldo separado, porque só serve para comida e mercado.
        </Tipografias.Legenda>
      </div>
      <Controller
        control={controlVr}
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
            rotuloAcessivel="Valor do VR"
          />
        )}
      />
      <Controller
        control={controlVr}
        name="dia"
        render={({ field }) => (
          <InputCustomizado.InputComum
            label="Em que dia o VR é creditado?"
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
      <div className="acoes">
        <BotaoCustomizado.BotaoPrimario larguraTotal onClick={handleSalvarVr} carregando={salvando}>
          Continuar
        </BotaoCustomizado.BotaoPrimario>
        <BotaoCustomizado.BotaoFantasma larguraTotal onClick={pularVr} disabled={salvando}>
          Não recebo VR
        </BotaoCustomizado.BotaoFantasma>
      </div>
    </Secao>
  );
};
