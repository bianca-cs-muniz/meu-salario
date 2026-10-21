import { type FC, type ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { GlobalStyles as MUIGlobalStyles } from '@mui/material';
import { ptBR as ptBRMaterial } from '@mui/material/locale';
import { SnackbarProvider } from 'notistack';
import { ConfirmProvider, type ConfirmOptions } from 'material-ui-confirm';
import { Pilula } from './styles';

/**
 * Tokens da paleta "moderna": barra lateral e blocos de destaque escuros (`cofre`, marinho profundo)
 * sobre o conteúdo claro (`papel` no fundo, `superficie` nos blocos, texto em `tinta`).
 * Nos styles use `theme.vars.palette.cores.X`; nunca cor fixa. `credito` colore só as entradas; saídas ficam em `tinta`.
 * Tokens `cofre*` são para o que fica sobre o fundo escuro; `grafico*` e `tooltip*` são do gráfico do Painel
 * (recharts precisa do valor real: leia via `useTheme().palette.cores`).
 */
interface ICores {
  papel: string;
  superficie: string;
  superficie2: string;
  tinta: string;
  mudo: string;
  linha: string;
  dinheiro: string;
  dinheiroSuave: string;
  sobreDinheiro: string;
  latao: string;
  cofre: string;
  cofreTinta: string;
  cofreMudo: string;
  /** Texto de destaque (quente) sobre o `cofre`: o `latao` não tem contraste no fundo escuro. */
  cofreDestaque: string;
  /** Texto de alerta sobre o `cofre` (valor negativo, fatura atrasada). */
  cofreAlerta: string;
  alerta: string;
  alertaSuave: string;
  atencao: string;
  atencaoSuave: string;
  credito: string;
  debito: string;
  graficoEntrada: string;
  graficoEntradaFim: string;
  graficoSaida: string;
  graficoSaidaFim: string;
  graficoSobra: string;
  graficoSobraInicio: string;
  tooltipFundo: string;
  tooltipTinta: string;
}

declare module '@mui/material/styles' {
  interface CssThemeVariables {
    enabled: true;
  }

  interface BreakpointOverrides {
    xxs: true;
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true;
    mobile: true;
    tablet: true;
    laptop: true;
    desktop: true;
  }

  interface Palette {
    cores: ICores;
  }

  interface PaletteOptions {
    cores?: ICores;
  }
}

/** Paleta moderna: barra lateral escura ("cofre") + container principal claro ("papel" e "superficie"). */
const CORES: ICores = {
  papel: '#F1F5F9',
  superficie: '#FFFFFF',
  superficie2: '#E2E8F0',
  tinta: '#0F172A',
  mudo: '#64748B',
  linha: '#CBD5E1',
  dinheiro: '#F43F98',
  dinheiroSuave: 'rgba(244,63,152,0.12)',
  sobreDinheiro: '#FFFFFF',
  latao: '#B45309',
  cofre: '#071A33',
  cofreTinta: '#FFFFFF',
  cofreMudo: '#9FB3CC',
  cofreDestaque: '#FCD34D',
  cofreAlerta: '#FF7070',
  alerta: '#EF4444',
  alertaSuave: 'rgba(239,68,68,0.08)',
  atencao: '#F59E0B',
  atencaoSuave: 'rgba(245,158,11,0.14)',
  credito: '#16A34A',
  debito: '#EF4444',
  graficoEntrada: '#10B981',
  graficoEntradaFim: '#059669',
  graficoSaida: '#FF4365',
  graficoSaidaFim: '#E11D48',
  graficoSobra: '#F59E0B',
  graficoSobraInicio: '#FCD34D',
  tooltipFundo: 'rgba(11,37,69,0.95)',
  tooltipTinta: '#F1F5FA',
};

const PALETA = {
  mode: 'light' as const,
  primary: { main: CORES.dinheiro, contrastText: CORES.sobreDinheiro },
  secondary: { main: CORES.latao },
  error: { main: CORES.alerta, contrastText: '#FFFFFF' },
  warning: { main: CORES.atencao },
  background: { default: CORES.papel, paper: CORES.superficie },
  text: { primary: CORES.tinta, secondary: CORES.mudo },
  divider: CORES.linha,
  cores: CORES,
};

const FONTE_TEXTO = '"Manrope", "Segoe UI", system-ui, -apple-system, sans-serif';
const FONTE_TITULO = '"Cormorant Garamond", "Iowan Old Style", Georgia, serif';

/** Visual padrão do `useConfirm()` (material-ui-confirm): janela arredondada, título em serifa, confirmar em alerta. */
const OPCOES_CONFIRMACAO: ConfirmOptions = {
  dialogProps: {
    maxWidth: 'xs',
    fullWidth: true,
    slotProps: { paper: { sx: { borderRadius: '24px', backgroundImage: 'none', p: 1 } } },
  },
  titleProps: { sx: { fontFamily: FONTE_TITULO, fontWeight: 600, fontSize: '1.75rem', lineHeight: 1 } },
  confirmationButtonProps: {
    variant: 'contained',
    color: 'error',
    disableElevation: true,
    sx: { borderRadius: '999px', fontWeight: 600, px: 2.5 },
  },
  cancellationButtonProps: {
    color: 'inherit',
    sx: { borderRadius: '999px', fontWeight: 600, color: 'text.secondary' },
  },
};

const tema = createTheme(
  {
    cssVariables: true,
    colorSchemes: { light: { palette: PALETA } },
    defaultColorScheme: 'light',
    typography: {
      fontFamily: FONTE_TEXTO,
      body1: { fontSize: '15.5px' },
      button: { textTransform: 'none' },
    },
    breakpoints: {
      values: {
        xxs: 0,
        xs: 300,
        sm: 600,
        md: 800,
        lg: 1200,
        xl: 1500,
        xxl: 1800,
        mobile: 600,
        tablet: 800,
        laptop: 1000,
        desktop: 1536,
      },
    },
    components: {
      MuiButtonBase: { defaultProps: { disableRipple: true } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            variants: [
              {
                props: { invisible: false },
                style: { backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(2px)' },
              },
            ],
          },
        },
      },
    },
  },
  ptBRMaterial,
);

interface IGlobals {
  children: ReactNode;
}

export const Globals: FC<IGlobals> = ({ children }) => {
  return (
    <ThemeProvider theme={tema}>
      <SnackbarProvider
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={3800}
        hideIconVariant
        Components={{ success: Pilula, error: Pilula, warning: Pilula, info: Pilula, default: Pilula }}
      >
        <ConfirmProvider defaultOptions={OPCOES_CONFIRMACAO}>
          <GlobalStyles />
          {children}
        </ConfirmProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

const GlobalStyles = () => (
  <MUIGlobalStyles
    styles={(theme) => {
      const c = theme.vars.palette.cores;
      return {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        '*': { margin: 0 },
        html: { background: c.papel, colorScheme: 'light' },
        body: {
          background: c.papel,
          color: c.tinta,
          fontFamily: FONTE_TEXTO,
          fontSize: '15.5px',
          lineHeight: 1.5,
          WebkitFontSmoothing: 'antialiased',
          overflowX: 'hidden',
        },
        'img, picture, video, canvas, svg': { display: 'block', maxWidth: '100%' },
        'input, button, textarea, select': { font: 'inherit', color: 'inherit' },
        button: { background: 'none', border: 0, padding: 0 },
        a: { color: 'inherit', textDecoration: 'none' },
        'ul, ol': { listStyle: 'none', padding: 0 },
        fieldset: { border: 0, padding: 0, minWidth: 0 },
        legend: { padding: 0 },
        'p, h1, h2, h3, h4, h5, h6': { overflowWrap: 'break-word' },
        '#root': { isolation: 'isolate' },
        ':focus-visible': { outline: `1.5px solid ${c.latao}`, outlineOffset: '2px' },
        '::selection': { background: c.dinheiroSuave },
        'input[type="date"]::-webkit-calendar-picker-indicator': { opacity: 0.55 },
        // Toasts acima da barra inferior no celular.
        '.notistack-SnackbarContainer': {
          bottom: '24px !important',
          [theme.breakpoints.down('tablet')]: {
            bottom: 'calc(5.5rem + env(safe-area-inset-bottom)) !important',
          },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            transition: 'none !important',
            animation: 'none !important',
          },
        },
      };
    }}
  />
);
