import { fileURLToPath } from 'node:url';
import { getBrowserTargets } from '@protoapps/browser-targets';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { widelyAvailableOnDate } from './config/browserPolicy/config.ts';

export default defineConfig({
  root: fileURLToPath(new URL('./gallery', import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  build: {
    target: getBrowserTargets({ widelyAvailableOnDate }),
    outDir: fileURLToPath(new URL('./gallery-dist', import.meta.url)),
    emptyOutDir: true,
  },
});
