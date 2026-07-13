import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

function assertAbsoluteUrl(name, value) {
  if (!value) {
    throw new Error(`${name} is required. Set it in .env before running or building the app.`);
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL like https://api.vuapp.dev. Do not use /api.`);
  }
  if (!/^https?:$/i.test(url.protocol) || !url.hostname) {
    throw new Error(`${name} must be an absolute URL like https://api.vuapp.dev. Do not use /api.`);
  }
}

function validateEnv(mode) {
  const env = loadEnv(mode, rootDir, 'VITE_');
  assertAbsoluteUrl('VITE_API_BASE_URL', env.VITE_API_BASE_URL?.trim());
  if (env.VITE_PUBLIC_API_ORIGIN) {
    assertAbsoluteUrl('VITE_PUBLIC_API_ORIGIN', env.VITE_PUBLIC_API_ORIGIN.trim());
  }
  assertAbsoluteUrl('VITE_AI_SERVICE_URL', env.VITE_AI_SERVICE_URL?.trim());
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  validateEnv(mode);

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            recharts: ['recharts'],
            motion: ['framer-motion'],
            'landing-graphics': ['ogl'],
            'smooth-scroll': ['lenis'],
          },
        },
      },
    },
  };
});
