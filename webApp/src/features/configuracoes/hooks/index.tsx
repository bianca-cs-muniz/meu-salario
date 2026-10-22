import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useConfirm } from 'material-ui-confirm';
import { useMeuPerfil } from '@hooks/useMeuPerfil';
import type { ICarteira, IVinculoTelegram } from '@services/tipos';
import { mensagemDeErro } from '@utils/erroHttp';
import { snackBar } from '@utils/SnackBar';
import { useCarteirasMutacoes, useStatusTelegram, useTelegramMutacoes } from './queryes';

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

// ---------- Telegram

/** Conectar (gera o link e espera o usuário tocar em Iniciar no bot) e desconectar o Telegram. */
export const useTelegram = () => {
  const [vinculo, setVinculo] = useState<IVinculoTelegram | null>(null);
  const { status, estaCarregando, erro, recarregar } = useStatusTelegram(vinculo);
  const { conectar, estaConectando, desconectar, estaDesconectando } = useTelegramMutacoes();
  const confirmar = useConfirm();

  // Conectou enquanto o link estava aberto: avisa (o link some porque o bloco passa a mostrar "Conectado").
  const conectouPeloLink = Boolean(vinculo && status?.conectado);
  useEffect(() => {
    if (conectouPeloLink) snackBar('Telegram conectado', 'success');
  }, [conectouPeloLink]);

  // Link expirou sem conectar: esconde o link (o polling para sozinho).
  useEffect(() => {
    if (!vinculo) return;
    const restante = new Date(vinculo.expiraEm).getTime() - Date.now();
    const timer = setTimeout(() => setVinculo(null), Math.max(restante, 0));
    return () => clearTimeout(timer);
  }, [vinculo]);

  const handleConectar = async () => {
    const novo = await conectar();
    if (novo) setVinculo(novo);
  };

  const handleDesconectar = async () => {
    const { confirmed } = await confirmar({
      title: 'Desconectar Telegram',
      description: 'O estagiário deixa de anotar o que você mandar pelo Telegram. Você pode conectar de novo quando quiser.',
      confirmationText: 'Desconectar',
      cancellationText: 'Cancelar',
    });
    if (!confirmed) return;
    if (await desconectar()) setVinculo(null);
  };

  return {
    status,
    estaCarregando,
    erro,
    recarregar,
    link: vinculo?.link ?? null,
    handleConectar,
    estaConectando,
    handleDesconectar,
    estaDesconectando,
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
