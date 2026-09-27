import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProtoConfig } from '@protoapps/eslint-config-vue';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));
const browserFiles = ['src/**/*.{js,ts}', '**/*.vue', 'tests/playwright/host/main.ts'];
const browserFileIgnores = ['**/*.vitest.ts', '**/*.pwtest.ts'];
const nodeFiles = ['*.config.{js,ts}', 'config/**/*.{js,ts}', 'tests/**/*.{js,ts}', 'src/**/*.{vitest,pwtest}.ts'];
const nodeFileIgnores = ['tests/playwright/host/main.ts'];

export default createProtoConfig(
  { tsconfigRootDir, vueVersion: '3.5.39' },
  globalIgnores([
    'node_modules/**', 'dist/**', 'coverage/**', '*.log',
    'test-results/**', 'playwright-report/**', '.stryker-tmp/**', 'reports/**',
    'tests/fixtures/package-consumer/**',
  ], 'dr-front/ignores'),
  {
    name: 'dr-front/browser',
    files: browserFiles,
    ignores: browserFileIgnores,
    languageOptions: { globals: globals.browser },
  },
  {
    name: 'dr-front/node',
    files: nodeFiles,
    ignores: nodeFileIgnores,
    languageOptions: { globals: globals.node },
  },
  {
    name: 'dr-front/tooling-imports',
    files: ['*.config.ts', 'config/**/*.{js,ts}'],
    rules: { '@typescript-eslint/no-restricted-imports': 'off' },
  },
);
