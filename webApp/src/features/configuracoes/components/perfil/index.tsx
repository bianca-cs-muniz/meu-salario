import { Bloco } from '@shared/components/bloco';
import { BotaoCustomizado } from '@shared/components/botao';
import { InputCustomizado } from '@shared/components/input';
import { MensagemErro } from '@shared/components/mensagemErro';
import { useFormularioPerfil } from '../../hooks';
import { Formulario } from './styles';

export const Perfil = () => {
  const { register, handleSalvar, salvando, semMudanca, erro } = useFormularioPerfil();

  return (
    <Bloco titulo="Perfil">
      <Formulario onSubmit={handleSalvar} noValidate>
        <div className="campo">
          <InputCustomizado.InputComum label="Nome" {...register('nome')} />
        </div>
        <BotaoCustomizado.BotaoSecundario type="submit" carregando={salvando} disabled={semMudanca}>
          Salvar nome
        </BotaoCustomizado.BotaoSecundario>
      </Formulario>
      <MensagemErro texto={erro} />
    </Bloco>
  );
};
