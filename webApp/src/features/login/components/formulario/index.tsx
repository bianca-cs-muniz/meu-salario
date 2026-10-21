import { BotaoCustomizado } from '@shared/components/botao';
import { InputCustomizado } from '@shared/components/input';
import { MensagemErro } from '@shared/components/mensagemErro';
import { useLoginFormulario } from '../../hooks';
import { Formulario } from './styles';

export const FormularioLogin = () => {
  const { register, handleEntrar, erro, estaLogando } = useLoginFormulario();

  return (
    <Formulario onSubmit={handleEntrar}>
      <InputCustomizado.InputComum label="E-mail" type="email" autoComplete="email" required {...register('email')} />
      <InputCustomizado.InputComum
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        {...register('senha')}
      />
      <MensagemErro texto={erro} />
      <BotaoCustomizado.BotaoPrimario type="submit" carregando={estaLogando}>
        Entrar
      </BotaoCustomizado.BotaoPrimario>
    </Formulario>
  );
};
