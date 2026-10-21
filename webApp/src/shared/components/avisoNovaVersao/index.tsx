import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Container } from './styles';

/** De quanto em quanto tempo o app pergunta ao servidor se há versão nova (1 hora). */
const INTERVALO_VERIFICACAO = 60 * 60 * 1000;

/**
 * Aviso de nova versão do PWA (registerType 'prompt'): a nova versão só assume quando a usuária
 * toca em "Atualizar"; "Agora não" esconde o aviso até o próximo carregamento do app.
 * Verifica a cada hora e ao voltar do segundo plano (no iPhone o intervalo fica pausado em
 * segundo plano, então a checagem ao voltar é a que garante a atualização).
 */
export const AvisoNovaVersao = () => {
  // Guarda o que foi registrado em onRegisteredSW para limpar se o componente desmontar.
  const limparVerificacao = useRef<(() => void) | null>(null);

  const {
    needRefresh: [precisaAtualizar, setPrecisaAtualizar],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registro) {
      if (!registro) return;
      limparVerificacao.current?.();

      const verificar = () => {
        if (!navigator.onLine) return;
        registro.update().catch(() => undefined);
      };
      const aoMudarVisibilidade = () => {
        if (document.visibilityState === 'visible') verificar();
      };

      const intervalo = window.setInterval(verificar, INTERVALO_VERIFICACAO);
      document.addEventListener('visibilitychange', aoMudarVisibilidade);

      limparVerificacao.current = () => {
        window.clearInterval(intervalo);
        document.removeEventListener('visibilitychange', aoMudarVisibilidade);
      };
    },
  });

  useEffect(
    () => () => {
      limparVerificacao.current?.();
      limparVerificacao.current = null;
    },
    [],
  );

  if (!precisaAtualizar) return null;

  return (
    <Container role="status" aria-live="polite">
      <span>Nova versão disponível</span>
      <div className="acoes">
        <button type="button" className="acao secundaria" onClick={() => setPrecisaAtualizar(false)}>
          Agora não
        </button>
        <button type="button" className="acao principal" onClick={() => updateServiceWorker(true)}>
          Atualizar
        </button>
      </div>
    </Container>
  );
};
