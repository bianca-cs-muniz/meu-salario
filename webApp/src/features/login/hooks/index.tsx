import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { mensagemDeErro } from '@utils/erroHttp';
import { useLoginMutacao } from './queryes';

const LoginSchema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail.'),
  senha: z.string().min(1, 'Informe a senha.'),
});

export type LoginForm = z.infer<typeof LoginSchema>;

export const useLoginFormulario = () => {
  const { logar, estaLogando, erroLogin } = useLoginMutacao();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    reValidateMode: 'onSubmit',
    defaultValues: { email: '', senha: '' },
  });

  const handleEntrar = handleSubmit((dados) => logar(dados));

  const erro =
    errors.email?.message ??
    errors.senha?.message ??
    (erroLogin ? mensagemDeErro(erroLogin, 'Não foi possível entrar.') : null);

  return { register, handleEntrar, erro, estaLogando };
};
