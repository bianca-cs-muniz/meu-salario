import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { mensagemDeErro } from '@utils/erroHttp';
import { useRegistrarMutacao } from './queryes';

const RegistrarSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.'),
  email: z.string().trim().min(1, 'Informe o e-mail.'),
  senha: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
});

export type RegistrarForm = z.infer<typeof RegistrarSchema>;

export const useRegistrarFormulario = () => {
  const { registrar, estaRegistrando, erroRegistro } = useRegistrarMutacao();

  const { register, handleSubmit, formState: { errors } } = useForm<RegistrarForm>({
    resolver: zodResolver(RegistrarSchema),
    reValidateMode: 'onSubmit',
    defaultValues: { nome: '', email: '', senha: '' },
  });

  const handleCriarConta = handleSubmit((dados) => registrar(dados));

  const erro =
    errors.nome?.message ??
    errors.email?.message ??
    errors.senha?.message ??
    (erroRegistro ? mensagemDeErro(erroRegistro, 'Não foi possível criar a conta.') : null);

  return { register, handleCriarConta, erro, estaRegistrando };
};
