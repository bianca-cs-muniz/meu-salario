/** Erro de resposta da API. `status` = 0 quando nem chegou à API (sem rede, API fora do ar). */
export class ErroHttp extends Error {
  status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = 'ErroHttp';
    this.status = status;
  }
}

export const MENSAGEM_SEM_CONEXAO = 'Não foi possível falar com o servidor. Verifique a conexão e tente de novo.';
export const MENSAGEM_ERRO_PADRAO = 'Algo deu errado. Tente novamente.';

/** Texto para mostrar ao usuário a partir de qualquer erro. */
export const mensagemDeErro = (e: unknown, padrao: string): string =>
  e instanceof Error && e.message ? e.message : padrao;

export const ehSemConexao = (e: unknown): boolean => e instanceof ErroHttp && e.status === 0;
