import LocalStorageService from "./localStorage.service";

/** Erro de resposta da API. `status` = 0 quando nem chegou à API (sem rede, API fora do ar). */
export class ErroHttp extends Error {
  constructor(
    mensagem: string,
    public status: number,
  ) {
    super(mensagem);
  }
}

class HttpClient {
  private baseUrl = "/api";

  private headersComAuth() {
    const token = LocalStorageService.obterToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async requisitar<T>(path: string, metodo: string, body?: unknown): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: metodo,
        headers: this.headersComAuth(),
        body: metodo === "GET" || metodo === "DELETE" ? undefined : JSON.stringify(body ?? {}),
      });
    } catch {
      throw new ErroHttp("Não foi possível falar com o servidor. Verifique a conexão e tente de novo.", 0);
    }

    if (response.status === 204) return undefined as T;
    const data = await response.json().catch(() => null);

    if (response.status === 401 && LocalStorageService.obterToken()) {
      // Token vencido ou inválido: limpa e volta para o login.
      LocalStorageService.removerToken();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    if (!response.ok) {
      throw new ErroHttp(data?.error || "Algo deu errado. Tente novamente.", response.status);
    }
    return data as T;
  }

  get<T>(path: string) {
    return this.requisitar<T>(path, "GET");
  }

  post<T>(path: string, body?: unknown) {
    return this.requisitar<T>(path, "POST", body);
  }

  put<T>(path: string, body?: unknown) {
    return this.requisitar<T>(path, "PUT", body);
  }

  patch<T>(path: string, body?: unknown) {
    return this.requisitar<T>(path, "PATCH", body);
  }

  delete<T>(path: string) {
    return this.requisitar<T>(path, "DELETE");
  }
}

export default HttpClient;
