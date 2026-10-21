import { Controller } from 'react-hook-form';
import { ROTULO_GRUPO } from '@constants/rotulos';
import type { ICategoria } from '@services/tipos';
import { BotaoCustomizado } from '@shared/components/botao';
import { CampoDinheiro } from '@shared/components/campoDinheiro';
import { Chips } from '@shared/components/chips';
import { Icone, IconeCategoria } from '@shared/components/iconeCategoria';
import { ICONES } from '@shared/components/iconeCategoria/icones';
import { InputCustomizado } from '@shared/components/input';
import { MensagemErro } from '@shared/components/mensagemErro';
import { ModalCustomizado } from '@shared/components/modal';
import { CORES_CATEGORIA, GRUPOS } from '../../cores';
import { useFormularioCategoria } from '../../hooks';
import { Amostra, Campo, Formulario, Grupo, Topo } from './styles';

interface IFormularioCategoria {
  categoria?: ICategoria;
  aoFechar: () => void;
}

export const FormularioCategoria = ({ categoria, aoFechar }: IFormularioCategoria) => {
  const f = useFormularioCategoria({ categoria, aoFechar });

  return (
    <ModalCustomizado open onClose={aoFechar} title={f.editando ? 'Editar categoria' : 'Nova categoria'}>
      <Formulario onSubmit={f.handleSalvar} noValidate>
        <Topo>
          <IconeCategoria nome={f.icone} cor={f.cor} tamanho={46} />
          <div className="nome">
            <InputCustomizado.InputComum label="Nome" {...f.register('nome')} />
          </div>
        </Topo>

        <Grupo>
          <legend>Ícone</legend>
          <Controller
            control={f.control}
            name="icone"
            render={({ field }) => (
              <div className="icones">
                {Object.keys(ICONES).map((nome) => (
                  <button
                    key={nome}
                    type="button"
                    aria-label={nome}
                    aria-pressed={field.value === nome}
                    onClick={() => field.onChange(nome)}
                    className={field.value === nome ? 'icone ativo' : 'icone'}
                  >
                    <Icone nome={nome} />
                  </button>
                ))}
              </div>
            )}
          />
        </Grupo>

        <Grupo>
          <legend>Cor</legend>
          <Controller
            control={f.control}
            name="cor"
            render={({ field }) => (
              <div className="cores">
                {CORES_CATEGORIA.map((c) => (
                  <Amostra
                    key={c}
                    type="button"
                    cor={c}
                    aria-label={`Cor ${c}`}
                    aria-pressed={field.value === c}
                    onClick={() => field.onChange(c)}
                    className={field.value === c ? 'ativa' : undefined}
                  />
                ))}
              </div>
            )}
          />
        </Grupo>

        <Grupo>
          <legend>Grupo na regra 50/30/20</legend>
          <Controller
            control={f.control}
            name="grupo"
            render={({ field }) => (
              <Chips
                rotulo="Grupo"
                opcoes={GRUPOS.map((g) => ({ valor: g, texto: ROTULO_GRUPO[g] }))}
                valor={field.value}
                aoMudar={field.onChange}
              />
            )}
          />
        </Grupo>

        <Campo>
          Limite por mês (opcional)
          <Controller
            control={f.control}
            name="limiteMensalCentavos"
            render={({ field }) => (
              <CampoDinheiro
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                inputRef={field.ref}
                rotuloAcessivel="Limite mensal"
              />
            )}
          />
          <span className="dica">O estagiário avisa quando passar de 80%.</span>
        </Campo>

        <Controller
          control={f.control}
          name="aceitaVr"
          render={({ field }) => (
            <InputCustomizado.InputCheckBox
              label="Pode ser paga com VR"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />

        <MensagemErro texto={f.erro} />

        <BotaoCustomizado.BotaoGrupo alinhamento="entre">
          {f.editando ? (
            <BotaoCustomizado.BotaoFantasma perigo={f.ativa} onClick={f.handleAlternarAtiva} disabled={f.salvando}>
              {f.ativa ? 'Desativar' : 'Reativar'}
            </BotaoCustomizado.BotaoFantasma>
          ) : (
            <span />
          )}
          <BotaoCustomizado.BotaoPrimario type="submit" carregando={f.salvando}>
            {f.editando ? 'Salvar alterações' : 'Criar categoria'}
          </BotaoCustomizado.BotaoPrimario>
        </BotaoCustomizado.BotaoGrupo>
      </Formulario>
    </ModalCustomizado>
  );
};
