import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProtoConfig } from '@protoapps/eslint-config';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));
const browserFiles = ['src/**/*.{js,ts}', '**/*.vue', 'gallery/**/*.{js,ts}'];
const browserFileIgnores = ['**/*.vitest.ts', '**/*.pwtest.ts'];
const nodeFiles = ['*.config.{js,ts}', 'config/**/*.{js,ts}', 'tests/**/*.{js,ts}', '**/*.{vitest,pwtest}.ts'];

export default createProtoConfig(
  { tsconfigRootDir, vue: { version: '3.5.39' }, vitest: true },
  globalIgnores([
    'node_modules/**', 'dist/**', 'gallery-dist/**', 'coverage/**', '*.log',
    'test-results/**', 'playwright-report/**', '.stryker-tmp/**', 'reports/**',
    'tests/fixtures/package-consumer/**',
  ], 'dr-front/ignores'),
  {
    name: 'dr-front/vitest-date-assertions',
    files: ['src/forms/lib/inputFormats/date/dateInputFormat.vitest.ts'],
    rules: {
      'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', 'assert', 'expectValidDate'] }],
    },
  },
  {
    name: 'dr-front/vitest-time-assertions',
    files: ['src/forms/lib/inputFormats/time/timeInputFormat.vitest.ts'],
    rules: {
      'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', 'assert', 'expectValidTime'] }],
    },
  },
  {
    name: 'dr-front/browser',
    files: browserFiles,
    ignores: browserFileIgnores,
    languageOptions: { globals: globals.browser },
  },
  {
    name: 'dr-front/node',
    files: nodeFiles,
    languageOptions: { globals: globals.node },
  },
  {
    name: 'dr-front/tooling-imports',
    files: ['*.config.ts', 'config/**/*.{js,ts}'],
    rules: { '@typescript-eslint/no-restricted-imports': 'off' },
  },
);
