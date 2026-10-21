import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMeuPerfil } from '@hooks/useMeuPerfil';
import type { ICarteira } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import { formatarCelular } from '@utils/Mascara';
import { snackBar } from '@utils/SnackBar';
import { useCarteirasMutacoes } from './queryes';

// ---------- Perfil

const PerfilSchema = z.object({
  nome: z.string().refine((v) => v.trim().length > 0, 'Escreva seu nome.'),
});

export type PerfilForm = z.infer<typeof PerfilSchema>;

export const useFormularioPerfil = () => {
  const { usuario, atualizarPerfil } = useMeuPerfil();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<PerfilForm>({
    resolver: zodResolver(PerfilSchema),
    reValidateMode: 'onSubmit',
    defaultValues: { nome: usuario?.nome ?? '' },
  });

  const nome = useWatch({ control, name: 'nome' });

  const handleSalvar = handleSubmit(async (d) => {
    setErroServidor(null);
    try {
      await atualizarPerfil({ nome: d.nome.trim() });
      snackBar('Nome atualizado', 'success');
    } catch (e) {
      setErroServidor(mensagemDeErro(e, 'Não foi possível salvar.'));
    }
  });

  return {
    register,
    handleSalvar,
    salvando: isSubmitting,
    semMudanca: nome.trim() === usuario?.nome,
    erro: errors.nome?.message ?? erroServidor,
  };
};

// ---------- WhatsApp

/** Número como a API guarda (só dígitos, com DDI) → texto do campo com a máscara de celular. */
const paraCampo = (telefone: string | null) => {
  if (!telefone) return '';
  const d = telefone.replace(/\D/g, '');
  return formatarCelular(d.length >= 12 && d.startsWith('55') ? d.slice(2) : d);
};

/** "5511999998888" → "+55 11 99999-8888" (como no legado). */
const formatarTelefone = (telefone: string) => {
  const d = telefone.replace(/\D/g, '');
  if (d.length < 12) return d;
  return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, d.length - 4)}-${d.slice(-4)}`;
};

const WhatsappSchema = z.object({
  // A máscara aceita até 11 dígitos (DDD + número); o DDI 55 é colocado ao salvar.
  telefone: z.string().refine((v) => {
    const d = v.replace(/\D/g, '');
    return d.length === 10 || d.length === 11;
  }, 'Digite o número com DDD, por exemplo 11 99999-8888.'),
});

export type WhatsappForm = z.infer<typeof WhatsappSchema>;

export const useFormularioWhatsapp = () => {
  const { usuario, atualizarPerfil } = useMeuPerfil();
  const vinculado = usuario?.telefoneWhatsapp ?? null;
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [desvinculando, setDesvinculando] = useState(false);

  const { control, handleSubmit, setValue, clearErrors, formState: { errors, isSubmitting } } = useForm<WhatsappForm>({
    resolver: zodResolver(WhatsappSchema),
    reValidateMode: 'onSubmit',
    defaultValues: { telefone: paraCampo(vinculado) },
  });

  /** Envia só dígitos (com DDI) ou null para desvincular. */
  const salvar = async (novo: string | null) => {
    setErroServidor(null);
    try {
      await atualizarPerfil({ telefoneWhatsapp: novo });
      setValue('telefone', paraCampo(novo));
      snackBar(novo ? 'WhatsApp vinculado' : 'WhatsApp desvinculado', 'success');
    } catch (e) {
      setErroServidor(mensagemDeErro(e, 'Não foi possível salvar.'));
    }
  };

  const handleSalvar = handleSubmit((d) => salvar(`55${d.telefone.replace(/\D/g, '')}`));

  const handleDesvincular = async () => {
    clearErrors();
    setDesvinculando(true);
    await salvar(null);
    setDesvinculando(false);
  };

  return {
    control,
    vinculado: vinculado ? formatarTelefone(vinculado) : null,
    handleSalvar,
    handleDesvincular,
    salvando: isSubmitting || desvinculando,
    erro: errors.telefone?.message ?? erroServidor,
  };
};

// ---------- Carteiras

/** Renomear carteira no lugar (um item por vez) e criar a carteira de VR. */
export const useEdicaoCarteiras = () => {
  const { renomear, estaRenomeando, criarVr, estaCriando } = useCarteirasMutacoes();
  const [editando, setEditando] = useState<string | null>(null);
  const [nome, setNome] = useState('');

  const abrirEdicao = (c: ICarteira) => {
    setEditando(c.id);
    setNome(c.nome);
  };

  const handleRenomear = async (c: ICarteira) => {
    if (!nome.trim()) return;
    const ok = await renomear(c.id, nome.trim());
    if (ok) setEditando(null);
  };

  return { editando, nome, setNome, abrirEdicao, handleRenomear, estaRenomeando, criarVr, estaCriando };
};

// ---------- Avisos

const CHAVE_AVISOS = 'meu-salario:avisos';

interface IAvisos {
  resumoSemanal: boolean;
  fatura: boolean;
}

/** No MVP as preferências ficam neste navegador. Quando a API tiver o campo, mover para o perfil. */
export const useAvisos = () => {
  const [avisos, setAvisos] = useState<IAvisos>(() => {
    const padrao: IAvisos = { resumoSemanal: true, fatura: true };
    try {
      return { ...padrao, ...JSON.parse(localStorage.getItem(CHAVE_AVISOS) ?? '{}') };
    } catch {
      return padrao;
    }
  });

  const alternar = (chave: keyof IAvisos) => {
    const novo = { ...avisos, [chave]: !avisos[chave] };
    setAvisos(novo);
    try {
      localStorage.setItem(CHAVE_AVISOS, JSON.stringify(novo));
    } catch {
      /* navegador sem armazenamento */
    }
  };

  return { avisos, alternar };
};
