import { Outlet } from 'react-router-dom';
import { CompetenciaProvider } from '@contexts/CompetenciaContext';
import { FormLancamentoProvider, useFormLancamento } from '@contexts/FormLancamentoContext';
import { useMeuPerfil } from '@hooks/useMeuPerfil';
import { FormularioLancamento } from '@features/lancamentos/components/formulario';
import { BarraLateral } from './barraLateral';
import { BarraInferior } from './barraInferior';
import { SemConexao } from './semConexao';
import { Conteudo, Corpo, TelaEmBranco } from './styles';

/** Formulário global de lançamento (aberto pelo botão + ou por "Corrigir"/"Editar" em qualquer tela). */
const FormularioAberto = () => {
  const { formAberto, fecharForm } = useFormLancamento();
  if (!formAberto) return null;
  return (
    <FormularioLancamento
      key={formAberto.lancamento?.id ?? 'novo'}
      lancamento={formAberto.lancamento}
      tipoInicial={formAberto.tipoInicial}
      aoFechar={fecharForm}
    />
  );
};

/** Layout das telas logadas: barra lateral no desktop, barra inferior no celular. */
export const MenuNavegacao = () => {
  const { usuario, estaCarregando, semConexao, tentarDeNovo } = useMeuPerfil();

  // Só troca o app pela tela de erro se ainda não há perfil em cache.
  if (!estaCarregando && semConexao && !usuario) return <SemConexao tentarDeNovo={tentarDeNovo} />;
  if (estaCarregando || !usuario) return <TelaEmBranco />;

  return (
    <CompetenciaProvider>
      <FormLancamentoProvider>
        <Corpo>
          <BarraLateral />
          <Conteudo component="main">
            <Outlet />
          </Conteudo>
        </Corpo>
        <BarraInferior />
        <FormularioAberto />
      </FormLancamentoProvider>
    </CompetenciaProvider>
  );
};
