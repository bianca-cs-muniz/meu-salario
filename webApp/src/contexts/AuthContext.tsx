/* eslint-disable react-refresh/only-export-components */
import localStorageService from '@services/localStorage.service';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useState } from 'react';
import type { FC, ReactNode } from 'react';

interface IAuthContextValue {
  signIn: boolean;
  signInHandler: (token: string) => void;
  signOutHandler: () => void;
}

const AuthContext = createContext({} as IAuthContextValue);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const [signIn, setSignIn] = useState(!!localStorageService.getToken());

  const signInHandler = useCallback((token: string) => {
    localStorageService.saveToken(token);
    queryClient.clear();
    setSignIn(true);
  }, [queryClient]);

  const signOutHandler = useCallback(() => {
    setSignIn(false);
    localStorageService.removeToken();
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ signIn, signInHandler, signOutHandler }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
