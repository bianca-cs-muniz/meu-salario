import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => {
  // API_URL só é usada pelo proxy de dev/preview (não vai para o bundle).
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = {
    '/api': {
      target: env.API_URL ?? 'http://localhost:4000',
      changeOrigin: true,
    },
  };

  return {
    plugins: [
      react(),
      VitePWA({
        // 'prompt': a nova versão só assume quando a usuária toca em "Atualizar" (avisoNovaVersao).
        registerType: 'prompt',
        includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
        manifest: {
          name: 'Meu Salário',
          short_name: 'Meu Salário',
          description: 'Quanto do salário ainda sobra este mês.',
          lang: 'pt-BR',
          dir: 'ltr',
          id: '/',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#F1F5F9',
          background_color: '#F1F5F9',
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Só o "casco" do app (JS, CSS, HTML, ícones e fontes latinas) vai para o cache.
          globPatterns: ['**/*.{js,css,html,png,ico,svg}', '**/*latin*.woff2'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          cleanupOutdatedCaches: true,
          // Proibido adicionar runtimeCaching para a API (dados financeiros autenticados).
        },
        devOptions: { enabled: false },
      }),
    ],
    server: { port: 3000, strictPort: true, proxy },
    preview: { port: 3000, strictPort: true, proxy },
    resolve: {
      alias: {
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@contexts': path.resolve(__dirname, 'src/contexts'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@tests': path.resolve(__dirname, 'src/tests'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@errors': path.resolve(__dirname, 'src/errors'),
        '@features': path.resolve(__dirname, 'src/features'),
        '@constants': path.resolve(__dirname, 'src/constants'),
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  };
});
