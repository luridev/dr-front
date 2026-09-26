import { fileURLToPath } from 'node:url';
import { getBrowserTargets } from '@protoapps/browser-targets';
import vue from '@vitejs/plugin-vue';
import ts from 'typescript';
import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vite';
import { widelyAvailableOnDate } from './config/browserPolicy/config.ts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      processor: 'vue',
      tsconfigPath: './tsconfig.build.json',
      entryRoot: './src',
      outDirs: './dist/types',
      pathsToAliases: true,
      bundleTypes: false,
      insertTypesEntry: false,
      afterDiagnostic(diagnostics) {
        if (diagnostics.some((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)) {
          throw new Error('Declaration diagnostics contain errors');
        }
      },
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    target: getBrowserTargets({ widelyAvailableOnDate }),
    lib: {
      entry: {
        index: fileURLToPath(new URL('./config/build/index.ts', import.meta.url)),
        icons: fileURLToPath(new URL('./src/icons.ts', import.meta.url)),
        lib: fileURLToPath(new URL('./src/lib.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'styles',
    },
    rolldownOptions: { external: ['vue', '@maskito/core', '@maskito/kit', '@maskito/vue'] },
  },
});
