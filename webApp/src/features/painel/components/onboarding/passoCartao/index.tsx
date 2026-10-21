import { Controller } from 'react-hook-form';
import { BotaoCustomizado } from '@shared/components/botao';
import { InputCustomizado } from '@shared/components/input';
import { MensagemErro } from '@shared/components/mensagemErro';
import { Tipografias } from '@shared/components/tipografias';
import type { IOnboardingEstado } from '../../../hooks';
import { Secao } from './styles';

export const PassoCartao = ({ onboarding }: { onboarding: IOnboardingEstado }) => {
  const { controlCartao, registerCartao, nomeCartao, cartoesCriados, terminar, adicionarOutroCartao, salvando, erro } =
    onboarding;

  return (
    <Secao component="section">
      <div>
        <Tipografias.Titulo component="h1" className="titulo">
          E cartão de crédito?
        </Tipografias.Titulo>
        <Tipografias.Legenda className="explicacao">
          Com o dia de fechamento, o app sabe em qual fatura cada compra cai.
        </Tipografias.Legenda>
      </div>
      {cartoesCriados.length > 0 && (
        <Tipografias.LegendaSimples className="adicionados">
          Adicionado: {cartoesCriados.join(', ')}
        </Tipografias.LegendaSimples>
      )}
      <InputCustomizado.InputComum label="Nome do cartão" placeholder="Nubank, Inter…" {...registerCartao('nome')} />
      <div className="dias">
        <Controller
          control={controlCartao}
          name="fechamento"
          render={({ field }) => (
            <InputCustomizado.InputComum
              label="Dia do fechamento"
              inputMode="numeric"
              name={field.name}
              ref={field.ref}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
            />
          )}
        />
        <Controller
          control={controlCartao}
          name="vencimento"
          render={({ field }) => (
            <InputCustomizado.InputComum
              label="Dia do vencimento"
              inputMode="numeric"
              name={field.name}
              ref={field.ref}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
            />
          )}
        />
      </div>
      <MensagemErro texto={erro} />
      <div className="acoes">
        <BotaoCustomizado.BotaoPrimario larguraTotal onClick={terminar} carregando={salvando}>
          {nomeCartao ? 'Salvar e terminar' : 'Terminar'}
        </BotaoCustomizado.BotaoPrimario>
        <BotaoCustomizado.BotaoSecundario larguraTotal onClick={adicionarOutroCartao} disabled={!nomeCartao || salvando}>
          Salvar e adicionar outro
        </BotaoCustomizado.BotaoSecundario>
      </div>
    </Secao>
  );
};
