const CHAVE_TOKEN = 'meu-salario:token';

class LocalStorageService {
  saveToken = (token: string) => {
    if (!token) return;
    localStorage.setItem(CHAVE_TOKEN, token);
  };

  getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(CHAVE_TOKEN);
    if (!token || token === 'undefined') return null;
    return token;
  };

  removeToken = () => localStorage.removeItem(CHAVE_TOKEN);

  saveObject = (obj: object, key: string) => localStorage.setItem(key, JSON.stringify(obj));

  getObject = (key: string) => {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data);
  };

  removeObject = (key: string) => localStorage.removeItem(key);
}

export default new LocalStorageService();
