// frontend/vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // `loadEnv` carga las variables de entorno del archivo .env.<mode>
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      proxy: {
        '/api': {
          // El target ahora es la variable de entorno del archivo .env cargado
          target: env.VITE_API_TARGET,
          changeOrigin: true,
          //rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  });
};