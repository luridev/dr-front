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
    emptyOutDir: true,
    target: getBrowserTargets({ widelyAvailableOnDate }),
    lib: {
      entry: {
        index: fileURLToPath(new URL('./config/build/index.ts', import.meta.url)),
        icons: fileURLToPath(new URL('./src/icons.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'styles',
    },
    rolldownOptions: {
      external: ['vue', /^imask(?:\/|$)/, /^@floating-ui\//, /^focus-trap(?:\/|$)/, /^tabbable(?:\/|$)/],
      output: {
        preserveModules: true,
        preserveModulesRoot: fileURLToPath(new URL('.', import.meta.url)),
        entryFileNames: (chunk) => `${chunk.name.replace(/[^a-zA-Z0-9_./-]/g, '_')}.js`,
      },
    },
  },
});
