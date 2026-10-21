import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { ROTA_INICIAL, rotas } from '@constants/rotas';
import { MenuNavegacao } from '@features/navegacao';
import { LoginPagina } from '@features/login/pages';
import { RegistrarPagina } from '@features/registrar/pages';
import { PendenciasPagina } from '@features/pendencias/pages';
import { LancamentosPagina } from '@features/lancamentos/pages';
import { CartoesPagina } from '@features/cartoes/pages';
import { FaturaPagina } from '@features/faturas/pages';
import { FixosPagina } from '@features/fixos/pages';
import { CategoriasPagina } from '@features/categorias/pages';
import { ConfiguracoesPagina } from '@features/configuracoes/pages';
import { PainelPagina } from '@features/painel/pages';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROTA_INICIAL} replace />} />

        {/* Rotas públicas */}
        <Route element={<AuthGuard isPrivate={false} />}>
          <Route path={rotas.LOGIN} element={<LoginPagina />} />
          <Route path={rotas.REGISTRAR} element={<RegistrarPagina />} />
        </Route>

        {/* Rotas privadas (com barra lateral / barra inferior) */}
        <Route element={<AuthGuard isPrivate={true} />}>
          <Route element={<MenuNavegacao />}>
            <Route path={rotas.PENDENCIAS} element={<PendenciasPagina />} />
            <Route path={rotas.LANCAMENTOS} element={<LancamentosPagina />} />
            <Route path={rotas.CARTOES} element={<CartoesPagina />} />
            <Route path={`${rotas.CARTOES}/:id`} element={<FaturaPagina />} />
            <Route path={rotas.FIXOS} element={<FixosPagina />} />
            <Route path={rotas.CATEGORIAS} element={<CategoriasPagina />} />
            <Route path={rotas.CONFIGURACOES} element={<ConfiguracoesPagina />} />
            <Route path={rotas.PAINEL} element={<PainelPagina />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
