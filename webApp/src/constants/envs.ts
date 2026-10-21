/* eslint-disable @typescript-eslint/no-explicit-any */
interface IEnvs {
  VITE_API_URL: string;
  VITE_ENVIRONMENT_NAME: string;
}

/** Em produção (nginx) lê de window.__ENV__; em dev, do .env do Vite. */
export const Envs: IEnvs = (() => {
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__;
  }

  return {
    VITE_API_URL: import.meta.env.VITE_API_URL || '/api',
    VITE_ENVIRONMENT_NAME: import.meta.env.VITE_ENVIRONMENT_NAME,
  };
})();
