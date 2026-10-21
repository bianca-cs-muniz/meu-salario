import { Controller } from 'react-hook-form';
import type { ILancamento, TipoLancamento } from '@services/tipos';
import { ModalCustomizado } from '@shared/components/modal';
import { ConfirmacaoOpcoes } from '@shared/components/modal/confirmacaoOpcoes';
import { Alternador } from '@shared/components/alternador';
import { CampoDinheiro } from '@shared/components/campoDinheiro';
import { Esqueleto } from '@shared/components/esqueleto';
import { InputCustomizado } from '@shared/components/input';
import { MensagemErro } from '@shared/components/mensagemErro';
import { Tipografias } from '@shared/components/tipografias';
import { useFormularioLancamento } from '../../hooks';
import { FormaPagamento } from './formaPagamento';
import { Credito } from './credito';
import { GradeCategorias } from './gradeCategorias';
import { Carteira } from './carteira';
import { Rodape } from './rodape';
import { AvisoEstagiario, Esqueletos, Formulario } from './styles';

interface IFormularioLancamento {
  lancamento?: ILancamento;
  tipoInicial?: TipoLancamento;
  aoFechar: () => void;
}

/** Formulário único de gasto/entrada. Aberto pelo FormLancamentoContext e renderizado pelo layout. */
export const FormularioLancamento = ({ lancamento, tipoInicial, aoFechar }: IFormularioLancamento) => {
  const f = useFormularioLancamento({ lancamento, tipoInicial, aoFechar });

  const titulo = f.editando ? 'Editar lançamento' : f.tipo === 'SAIDA' ? 'Novo gasto' : 'Nova entrada';

  return (
    <ModalCustomizado open onClose={aoFechar} title={titulo}>
      {f.carregandoOpcoes ? (
        <Esqueletos>
          <Esqueleto altura={48} />
          <Esqueleto altura={96} />
          <Esqueleto altura={40} />
        </Esqueletos>
      ) : (
        <Formulario onSubmit={f.handleSalvar} noValidate>
          {!f.editando && (
            <Controller
              control={f.control}
              name="tipo"
              render={({ field }) => (
                <Alternador
                  opcoes={[
                    { valor: 'SAIDA', texto: 'Gasto' },
                    { valor: 'ENTRADA', texto: 'Entrada' },
                  ]}
                  valor={field.value}
                  aoMudar={field.onChange}
                />
              )}
            />
          )}

          {lancamento?.observacao && !lancamento.revisado && (
            <AvisoEstagiario component="p">O estagiário anotou: {lancamento.observacao}</AvisoEstagiario>
          )}

          <Controller
            control={f.control}
            name="valorCentavos"
            render={({ field }) => (
              <CampoDinheiro
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                inputRef={field.ref}
                grande
                autoFocus={!f.editando}
                rotuloAcessivel="Valor"
              />
            )}
          />

          <InputCustomizado.InputComum
            label="Descrição"
            maxLength={80}
            placeholder={f.tipo === 'SAIDA' ? 'Mercado, Uber, conta de luz…' : 'Freela, 13º, venda…'}
            {...f.register('descricao')}
          />

          {f.tipo === 'SAIDA' && (
            <>
              <Controller
                control={f.control}
                name="formaPagamento"
                render={({ field }) => (
                  <FormaPagamento
                    formas={f.formasDisponiveis}
                    forma={field.value}
                    aoMudar={(forma) => {
                      field.onChange(forma);
                      f.ajustarCategoriaParaForma(forma);
                    }}
                    carteiraVr={f.carteiraVr}
                  />
                )}
              />

              {f.forma === 'CREDITO' && (
                <Credito
                  cartoes={f.opcoes?.cartoes ?? []}
                  editando={f.editando}
                  valor={f.valor}
                  cartaoEscolhido={f.cartaoEscolhido}
                  dataEhHoje={f.dataEhHoje}
                  control={f.control}
                />
              )}

              <Controller
                control={f.control}
                name="categoriaId"
                render={({ field }) => (
                  <GradeCategorias
                    categorias={f.categoriasVisiveis}
                    categoriaId={field.value}
                    aoEscolher={field.onChange}
                    soVr={f.forma === 'VR'}
                  />
                )}
              />
            </>
          )}

          {f.tipo === 'ENTRADA' && (f.opcoes?.carteiras.length ?? 0) > 1 && (
            <Carteira carteiras={f.opcoes!.carteiras} control={f.control} />
          )}

          <Controller
            control={f.control}
            name="data"
            render={({ field }) => (
              <InputCustomizado.InputComum
                label="Data"
                type="date"
                name={field.name}
                ref={field.ref}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )}
          />

          {f.ehRecorrencia && (
            <Tipografias.LegendaSimples>
              Este é um gasto fixo. A alteração vale só para este mês; para mudar todos os meses, use Gastos fixos.
            </Tipografias.LegendaSimples>
          )}

          <MensagemErro texto={f.erro} />

          <Rodape editando={f.editando} tipo={f.tipo} salvando={f.salvando} aoExcluir={f.perguntarExclusao} />
        </Formulario>
      )}

      {lancamento && (
        <ConfirmacaoOpcoes
          open={f.pergunta === 'salvar'}
          titulo="Alterar parcelas"
          texto={`Esta é a parcela ${lancamento.parcelaNumero} de ${lancamento.parcelaTotal}. Aplicar a alteração em quais?`}
          opcoes={[
            { texto: 'Só nesta', acao: () => f.salvarParcelas(false) },
            { texto: 'Nesta e nas próximas', acao: () => f.salvarParcelas(true) },
          ]}
          onClose={f.fecharPergunta}
        />
      )}

      {lancamento && (
        <ConfirmacaoOpcoes
          open={f.pergunta === 'excluir'}
          titulo="Excluir lançamento"
          texto={
            f.ehParcela
              ? `Esta é a parcela ${lancamento.parcelaNumero} de ${lancamento.parcelaTotal}. O que você quer excluir?`
              : `Excluir “${lancamento.descricao}”? Isso não pode ser desfeito.`
          }
          opcoes={
            f.ehParcela
              ? [
                  { texto: 'Só esta parcela', perigo: true, acao: () => f.handleExcluir(false) },
                  { texto: 'Esta e as próximas', perigo: true, acao: () => f.handleExcluir(true) },
                ]
              : [{ texto: 'Excluir', perigo: true, acao: () => f.handleExcluir(false) }]
          }
          onClose={f.fecharPergunta}
        />
      )}
    </ModalCustomizado>
  );
};
