import useAuth from '@contexts/AuthContext';
import { type FC } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { ROTA_INICIAL, rotas } from '@constants/rotas';

interface AuthGuardProps {
  isPrivate: boolean;
}

export const AuthGuard: FC<AuthGuardProps> = ({ isPrivate }) => {
  const { signIn } = useAuth();

  if (!signIn && isPrivate) {
    return <Navigate to={rotas.LOGIN} replace />;
  }

  if (signIn && !isPrivate) {
    return <Navigate to={ROTA_INICIAL} replace />;
  }

  return <Outlet />;
};
