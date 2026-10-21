import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCarteirasLista } from '@features/configuracoes/hooks/queryes';
import { useInvalidarDados } from '@hooks/useInvalidarDados';
import { useMeuPerfil } from '@hooks/useMeuPerfil';
import { mensagemDeErro } from '@utils/erroHttp';
import { snackBar } from '@utils/SnackBar';
import { useOnboardingMutacoes } from './queryes';

export type PassoOnboarding = 'salario' | 'vr' | 'cartao';
const PASSOS: PassoOnboarding[] = ['salario', 'vr', 'cartao'];

/** Cor do cartão criado no Onboarding (dado salvo na API, igual ao legado; dá para trocar em Cartões). */
const COR_CARTAO_ONBOARDING = '#795064';
const MENSAGEM_DIA = 'O dia precisa ser entre 1 e 28.';

const diaValido = (texto: string) => {
  const n = Number(texto);
  return texto !== '' && Number.isInteger(n) && n >= 1 && n <= 28;
};

const SalarioSchema = z
  .object({ valorCentavos: z.number().nullable(), dia: z.string() })
  .superRefine((d, ctx) => {
    if (!d.valorCentavos || d.valorCentavos <= 0) {
      ctx.addIssue({ code: 'custom', path: ['valorCentavos'], message: 'Digite o valor do salário, por exemplo 3.500,00.' });
    } else if (!diaValido(d.dia)) {
      ctx.addIssue({ code: 'custom', path: ['dia'], message: MENSAGEM_DIA });
    }
  });

const VrSchema = z
  .object({ valorCentavos: z.number().nullable(), dia: z.string() })
  .superRefine((d, ctx) => {
    if (!d.valorCentavos || d.valorCentavos <= 0) {
      ctx.addIssue({ code: 'custom', path: ['valorCentavos'], message: 'Digite o valor do VR ou toque em “Não recebo VR”.' });
    } else if (!diaValido(d.dia)) {
      ctx.addIssue({ code: 'custom', path: ['dia'], message: MENSAGEM_DIA });
    }
  });

const CartaoSchema = z
  .object({ nome: z.string(), fechamento: z.string(), vencimento: z.string() })
  .superRefine((d, ctx) => {
    // Tudo vazio = "Terminar" sem cadastrar cartão.
    if (!d.nome && !d.fechamento && !d.vencimento) return;
    if (!d.nome.trim()) {
      ctx.addIssue({ code: 'custom', path: ['nome'], message: 'Dê um nome ao cartão, por exemplo Nubank.' });
    } else if (!diaValido(d.fechamento) || !diaValido(d.vencimento)) {
      ctx.addIssue({
        code: 'custom',
        path: ['fechamento'],
        message: 'Os dias de fechamento e vencimento precisam ser entre 1 e 28.',
      });
    }
  });

export type SalarioForm = z.infer<typeof SalarioSchema>;
export type VrForm = z.infer<typeof VrSchema>;
export type CartaoForm = z.infer<typeof CartaoSchema>;

/** Os 3 passos do primeiro acesso: salário, VR e cartão de crédito. */
export const useOnboarding = () => {
  const { usuario } = useMeuPerfil();
  const carteiras = useCarteirasLista();
  const { criarEntradaFixa, criarCarteira, criarCartao } = useOnboardingMutacoes();
  const invalidarDados = useInvalidarDados();

  const [passo, setPasso] = useState<PassoOnboarding>('salario');
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [cartoesCriados, setCartoesCriados] = useState<string[]>([]);

  const formSalario = useForm<SalarioForm>({
    resolver: zodResolver(SalarioSchema),
    reValidateMode: 'onSubmit',
    defaultValues: { valorCentavos: null, dia: '5' },
  });

  const formVr = useForm<VrForm>({
    resolver: zodResolver(VrSchema),
    reValidateMode: 'onSubmit',
    defaultValues: { valorCentavos: null, dia: '1' },
  });

  const formCartao = useForm<CartaoForm>({
    resolver: zodResolver(CartaoSchema),
    reValidateMode: 'onSubmit',
    defaultValues: { nome: '', fechamento: '', vencimento: '' },
  });

  const nomeCartao = useWatch({ control: formCartao.control, name: 'nome' });

  /** Limpa o erro anterior, roda a ação e mostra a mensagem se falhar. */
  const executar = async (acao: () => Promise<void>) => {
    setErroServidor(null);
    try {
      await acao();
    } catch (e) {
      setErroServidor(mensagemDeErro(e, 'Não foi possível salvar.'));
    }
  };

  const handleSalvarSalario = formSalario.handleSubmit((d) =>
    executar(async () => {
      if (carteiras.erro) {
        carteiras.recarregar();
        throw new Error(carteiras.erro);
      }
      const conta = carteiras.lista?.find((c) => c.tipo === 'CONTA');
      if (!conta) throw new Error('Conta principal não encontrada. Verifique se a API cria a carteira CONTA no registro.');
      await criarEntradaFixa({
        tipo: 'ENTRADA',
        descricao: 'Salário',
        valorCentavos: d.valorCentavos!,
        diaDoMes: Number(d.dia),
        formaPagamento: 'PIX',
        carteiraId: conta.id,
      });
      setPasso('vr');
    }),
  );

  const handleSalvarVr = formVr.handleSubmit((d) =>
    executar(async () => {
      // Reaproveita a carteira VR que já existir (ex.: passo repetido), senão a API responde 409 VR_JA_EXISTE.
      const carteira =
        carteiras.lista?.find((c) => c.tipo === 'VR' && c.ativa) ?? (await criarCarteira({ nome: 'VR', tipo: 'VR' }));
      await criarEntradaFixa({
        tipo: 'ENTRADA',
        descricao: 'Crédito do VR',
        valorCentavos: d.valorCentavos!,
        diaDoMes: Number(d.dia),
        formaPagamento: 'VR',
        carteiraId: carteira.id,
      });
      setPasso('cartao');
    }),
  );

  const pularVr = () => {
    setErroServidor(null);
    setPasso('cartao');
  };

  const salvarCartao = (continuar: boolean) =>
    formCartao.handleSubmit((d) =>
      executar(async () => {
        if (d.nome || d.fechamento || d.vencimento) {
          const nome = d.nome.trim();
          await criarCartao({
            nome,
            diaFechamento: Number(d.fechamento),
            diaVencimento: Number(d.vencimento),
            limiteCentavos: null,
            cor: COR_CARTAO_ONBOARDING,
          });
          setCartoesCriados((c) => [...c, nome]);
          formCartao.reset({ nome: '', fechamento: '', vencimento: '' });
        }
        if (!continuar) {
          snackBar('Tudo pronto. Agora é só anotar os gastos.', 'success');
          // Com a entrada fixa salva, o resumo volta com `temEntradaFixa` e o painel aparece.
          await invalidarDados();
        }
      }),
    )();

  const errosPasso = {
    salario: formSalario.formState.errors.valorCentavos?.message ?? formSalario.formState.errors.dia?.message,
    vr: formVr.formState.errors.valorCentavos?.message ?? formVr.formState.errors.dia?.message,
    cartao: formCartao.formState.errors.nome?.message ?? formCartao.formState.errors.fechamento?.message,
  };

  // isSubmitting cobre do clique até o fim da ação (evita cadastro duplicado).
  const salvando =
    formSalario.formState.isSubmitting || formVr.formState.isSubmitting || formCartao.formState.isSubmitting;

  return {
    passo,
    indice: PASSOS.indexOf(passo),
    passos: PASSOS,
    primeiroNome: usuario?.nome ? usuario.nome.split(' ')[0] : null,
    erro: errosPasso[passo] ?? erroServidor,
    // Enquanto as carteiras não chegam, o "Continuar" do salário fica em "Salvando…" (como no legado).
    salvandoSalario: salvando || (carteiras.estaCarregando && !carteiras.lista),
    salvando,
    cartoesCriados,
    nomeCartao,
    controlSalario: formSalario.control,
    controlVr: formVr.control,
    controlCartao: formCartao.control,
    registerCartao: formCartao.register,
    handleSalvarSalario,
    handleSalvarVr,
    pularVr,
    terminar: () => salvarCartao(false),
    adicionarOutroCartao: () => salvarCartao(true),
  };
};

/** Tudo o que os passos do Onboarding recebem. */
export type IOnboardingEstado = ReturnType<typeof useOnboarding>;
