import { BotaoCustomizado } from '@shared/components/botao';
import { InputCustomizado } from '@shared/components/input';
import { MensagemErro } from '@shared/components/mensagemErro';
import { useRegistrarFormulario } from '../../hooks';
import { Formulario } from './styles';

export const FormularioRegistrar = () => {
  const { register, handleCriarConta, erro, estaRegistrando } = useRegistrarFormulario();

  return (
    <Formulario onSubmit={handleCriarConta}>
      <InputCustomizado.InputComum label="Nome" autoComplete="given-name" required {...register('nome')} />
      <InputCustomizado.InputComum label="E-mail" type="email" autoComplete="email" required {...register('email')} />
      <InputCustomizado.InputComum
        label="Senha"
        dica="Pelo menos 6 caracteres."
        type="password"
        autoComplete="new-password"
        required
        {...register('senha')}
      />
      <MensagemErro texto={erro} />
      <BotaoCustomizado.BotaoPrimario type="submit" carregando={estaRegistrando}>
        Criar conta
      </BotaoCustomizado.BotaoPrimario>
    </Formulario>
  );
};
