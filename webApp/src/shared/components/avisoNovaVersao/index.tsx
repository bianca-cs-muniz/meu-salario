import { useRegisterSW } from 'virtual:pwa-register/react';
import { Container } from './styles';

/** De quanto em quanto tempo o app pergunta ao servidor se há versão nova (1 hora). */
const INTERVALO_VERIFICACAO = 60 * 60 * 1000;

/**
 * Aviso de nova versão do PWA (registerType 'prompt'): a nova versão só assume quando a usuária
 * toca em "Atualizar"; "Agora não" esconde o aviso até a próxima verificação.
 */
export const AvisoNovaVersao = () => {
  const {
    needRefresh: [precisaAtualizar, setPrecisaAtualizar],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registro) {
      if (!registro) return;
      setInterval(() => {
        if (!navigator.onLine) return;
        registro.update().catch(() => undefined);
      }, INTERVALO_VERIFICACAO);
    },
  });

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
