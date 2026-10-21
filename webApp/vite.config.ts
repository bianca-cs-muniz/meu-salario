import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
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
    plugins: [react()],
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
