import axios, { type AxiosError } from 'axios';
import localStorageService from './localStorage.service';
import { Envs } from '@constants/envs';
import { ErroHttp, MENSAGEM_ERRO_PADRAO, MENSAGEM_SEM_CONEXAO } from '@utils/erroHttp';

export const httpClient = axios.create({
  baseURL: Envs.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorageService.getToken();
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
});

httpClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

/**
 * Todo erro sai daqui como `ErroHttp(mensagem, status)`:
 * - sem resposta (rede, API fora do ar) → status 0, não desloga;
 * - 401 com token salvo → apaga o token e volta para o login.
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    if (!error.response) {
      return Promise.reject(new ErroHttp(MENSAGEM_SEM_CONEXAO, 0));
    }

    const { status, data } = error.response;

    if (status === 401 && localStorageService.getToken()) {
      // Token vencido ou inválido: limpa e volta para o login.
      localStorageService.removeToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(new ErroHttp(data?.error || MENSAGEM_ERRO_PADRAO, status));
  },
);
