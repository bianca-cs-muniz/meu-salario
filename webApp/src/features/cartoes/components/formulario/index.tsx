import { Controller } from 'react-hook-form';
import { useConfirm } from 'material-ui-confirm';
import type { ICartao } from '@services/tipos';
import { BotaoCustomizado } from '@shared/components/botao';
import { CampoDinheiro } from '@shared/components/campoDinheiro';
import { InputCustomizado } from '@shared/components/input';
import { MensagemErro } from '@shared/components/mensagemErro';
import { ModalCustomizado } from '@shared/components/modal';
import { useFormularioCartao } from '../../hooks';
import { Cores, Dias, Formulario, Rodape, Rotulo } from './styles';

interface IFormularioCartao {
  cartao?: ICartao;
  aoFechar: () => void;
}

const soDigitos = (texto: string) => texto.replace(/\D/g, '');

/** Cadastro/edição de cartão (antigo FormCartao). */
export const FormularioCartao = ({ cartao, aoFechar }: IFormularioCartao) => {
  const f = useFormularioCartao({ cartao, aoFechar });
  const confirmar = useConfirm();

  const handleRemover = async () => {
    const { confirmed } = await confirmar({
      title: 'Remover cartão',
      description: `Remover o cartão “${cartao?.nome}”?`,
      confirmationText: 'Remover',
      cancellationText: 'Cancelar',
    });
    if (confirmed) await f.handleRemover();
  };

  return (
    <ModalCustomizado open onClose={aoFechar} title={f.editando ? 'Editar cartão' : 'Novo cartão'}>
      <Formulario onSubmit={f.handleSalvar} noValidate>
        <InputCustomizado.InputComum label="Nome" placeholder="Nubank, Inter…" autoFocus {...f.register('nome')} />

        <Dias>
          <Controller
            control={f.control}
            name="diaFechamento"
            render={({ field }) => (
              <InputCustomizado.InputComum
                label="Dia do fechamento"
                inputMode="numeric"
                name={field.name}
                ref={field.ref}
                value={field.value}
                onChange={(e) => field.onChange(soDigitos(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            control={f.control}
            name="diaVencimento"
            render={({ field }) => (
              <InputCustomizado.InputComum
                label="Dia do vencimento"
                inputMode="numeric"
                name={field.name}
                ref={field.ref}
                value={field.value}
                onChange={(e) => field.onChange(soDigitos(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
        </Dias>

        <Rotulo>
          Limite (opcional)
          <Controller
            control={f.control}
            name="limiteCentavos"
            render={({ field }) => (
              <CampoDinheiro
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                inputRef={field.ref}
                rotuloAcessivel="Limite"
              />
            )}
          />
        </Rotulo>

        <Controller
          control={f.control}
          name="cor"
          render={({ field }) => (
            <Cores>
              <legend>Cor</legend>
              <div className="opcoes">
                {f.cores.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Cor ${c}`}
                    aria-pressed={c === field.value}
                    onClick={() => field.onChange(c)}
                    className={c === field.value ? 'cor ativa' : 'cor'}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </Cores>
          )}
        />

        <MensagemErro texto={f.erro} />

        <Rodape>
          {f.editando ? (
            <BotaoCustomizado.BotaoFantasma perigo disabled={f.removendo} onClick={handleRemover}>
              Remover cartão
            </BotaoCustomizado.BotaoFantasma>
          ) : (
            <span />
          )}
          <BotaoCustomizado.BotaoPrimario type="submit" carregando={f.salvando}>
            {f.editando ? 'Salvar alterações' : 'Cadastrar cartão'}
          </BotaoCustomizado.BotaoPrimario>
        </Rodape>
      </Formulario>
    </ModalCustomizado>
  );
};
