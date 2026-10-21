import { Controller } from 'react-hook-form';
import { ROTULO_FORMA } from '@constants/rotulos';
import type { IRecorrencia, TipoLancamento } from '@services/tipos';
import { Alternador } from '@shared/components/alternador';
import { BotaoCustomizado } from '@shared/components/botao';
import { CampoDinheiro } from '@shared/components/campoDinheiro';
import { Chips } from '@shared/components/chips';
import { Esqueleto } from '@shared/components/esqueleto';
import { InputCustomizado } from '@shared/components/input';
import { MensagemErro } from '@shared/components/mensagemErro';
import { ModalCustomizado } from '@shared/components/modal';
import { useFormularioFixo } from '../../hooks';
import { Campo, Formulario, Grupo, Linha } from './styles';

interface IFormularioFixo {
  recorrencia?: IRecorrencia;
  tipoInicial: TipoLancamento;
  aoFechar: () => void;
}

export const FormularioFixo = ({ recorrencia, tipoInicial, aoFechar }: IFormularioFixo) => {
  const f = useFormularioFixo({ recorrencia, tipoInicial, aoFechar });

  return (
    <ModalCustomizado open onClose={aoFechar} title={f.editando ? 'Editar fixo' : 'Novo fixo'}>
      {f.carregandoOpcoes ? (
        <Esqueleto altura={256} />
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

          <InputCustomizado.InputComum
            label="Descrição"
            placeholder={f.tipo === 'SAIDA' ? 'Aluguel, internet, Netflix…' : 'Salário, aluguel recebido…'}
            {...f.register('descricao')}
          />

          <Linha>
            <Campo>
              Valor
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
                    rotuloAcessivel="Valor"
                  />
                )}
              />
            </Campo>
            <Controller
              control={f.control}
              name="dia"
              render={({ field }) => (
                <InputCustomizado.InputComum
                  label="Dia"
                  inputMode="numeric"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Linha>

          {f.tipo === 'SAIDA' ? (
            <>
              <Grupo>
                <legend>Como é pago</legend>
                <Controller
                  control={f.control}
                  name="formaPagamento"
                  render={({ field }) => (
                    <Chips
                      rotulo="Como é pago"
                      opcoes={f.formas.map((forma) => ({ valor: forma, texto: ROTULO_FORMA[forma] }))}
                      valor={field.value}
                      aoMudar={field.onChange}
                    />
                  )}
                />
              </Grupo>

              {f.forma === 'CREDITO' && f.cartoes.length > 1 && (
                <Controller
                  control={f.control}
                  name="cartaoId"
                  render={({ field }) => (
                    <InputCustomizado.InputSelecao
                      label="Cartão"
                      name={field.name}
                      ref={field.ref}
                      value={f.cartaoEfetivo}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                    >
                      {f.cartoes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </InputCustomizado.InputSelecao>
                  )}
                />
              )}

              <Controller
                control={f.control}
                name="categoriaId"
                render={({ field }) => (
                  <InputCustomizado.InputSelecao
                    label="Categoria"
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                  >
                    <option value="">Escolha…</option>
                    {f.categoriasAtivas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </InputCustomizado.InputSelecao>
                )}
              />
            </>
          ) : (
            f.carteiras.length > 1 && (
              <Controller
                control={f.control}
                name="carteiraId"
                render={({ field }) => (
                  <InputCustomizado.InputSelecao
                    label="Onde entra"
                    name={field.name}
                    ref={field.ref}
                    value={f.carteiraEfetiva}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                  >
                    {f.carteiras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </InputCustomizado.InputSelecao>
                )}
              />
            )
          )}

          <MensagemErro texto={f.erro} />

          <BotaoCustomizado.BotaoGrupo alinhamento="entre">
            {f.editando ? (
              <BotaoCustomizado.BotaoFantasma perigo onClick={f.handleEncerrar} carregando={f.estaEncerrando}>
                Encerrar
              </BotaoCustomizado.BotaoFantasma>
            ) : (
              <span />
            )}
            <BotaoCustomizado.BotaoPrimario type="submit" carregando={f.salvando}>
              {f.editando ? 'Salvar alterações' : 'Adicionar fixo'}
            </BotaoCustomizado.BotaoPrimario>
          </BotaoCustomizado.BotaoGrupo>
        </Formulario>
      )}
    </ModalCustomizado>
  );
};
