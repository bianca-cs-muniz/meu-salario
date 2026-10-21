import { MessageCircle } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { Bloco } from '@shared/components/bloco';
import { BotaoCustomizado } from '@shared/components/botao';
import { InputCustomizado } from '@shared/components/input';
import { MensagemErro } from '@shared/components/mensagemErro';
import { formatarCelular } from '@utils/Mascara';
import { useFormularioWhatsapp } from '../../hooks';
import { Container } from './styles';

const EXEMPLOS = [
  { mensagem: 'mercado 230 vr', efeito: 'anota no VR' },
  { mensagem: 'ifood 45 cartão', efeito: 'anota no cartão' },
  { mensagem: 'tênis 600 em 3x', efeito: 'cria as parcelas' },
  { mensagem: 'quanto sobrou?', efeito: 'responde a sobra do mês' },
  { mensagem: 'apaga o último', efeito: 'desfaz o último registro' },
];

export const Whatsapp = () => {
  const { control, vinculado, handleSalvar, handleDesvincular, salvando, erro } = useFormularioWhatsapp();

  return (
    <Bloco titulo="Estagiário no WhatsApp">
      <Container>
        {vinculado ? (
          <p className="status">
            <MessageCircle size={18} className="iconeWhatsapp" />
            Vinculado ao número <strong>{vinculado}</strong>
          </p>
        ) : (
          <p className="status mudo">Vincule seu número para anotar gastos mandando mensagem, sem abrir o app.</p>
        )}

        <form className="formulario" onSubmit={handleSalvar} noValidate>
          <div className="campo">
            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <InputCustomizado.InputComum
                  label="Seu número de WhatsApp"
                  inputMode="tel"
                  placeholder="11 99999-8888"
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onChange={(e) => field.onChange(formatarCelular(e.target.value))}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <BotaoCustomizado.BotaoSecundario type="submit" carregando={salvando}>
            {vinculado ? 'Trocar número' : 'Vincular'}
          </BotaoCustomizado.BotaoSecundario>
        </form>

        <MensagemErro texto={erro} />

        {vinculado && (
          <button type="button" onClick={handleDesvincular} disabled={salvando} className="desvincular">
            Desvincular
          </button>
        )}

        <div className="exemplos">
          <p className="tituloExemplos">Exemplos do que mandar</p>
          <ul>
            {EXEMPLOS.map((e) => (
              <li key={e.mensagem}>
                <span className="mensagem">{e.mensagem}</span> {e.efeito}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Bloco>
  );
};
