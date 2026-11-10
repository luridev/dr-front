import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProtoConfig } from '@protoapps/eslint-config';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));
const browserFiles = ['src/**/*.{js,ts}', '**/*.vue', 'gallery/**/*.{js,ts}'];
const browserFileIgnores = ['**/*.vitest.ts', '**/*.pwtest.ts'];
const nodeFiles = ['*.config.{js,ts}', 'config/**/*.{js,ts}', 'scripts/**/*.ts', 'tests/**/*.{js,ts}', '**/*.{vitest,pwtest}.ts'];

export default createProtoConfig(
  {
    tsconfigRootDir,
    vue: { version: '3.5.39' },
    vitest: true,
    playwright: {
      files: [
        '**/*.pwtest.ts',
        'tests/playwright/fixtures.ts',
        'tests/playwright/lib/**/*.ts',
        'src/actions/components/DrButton/DrButtonFocusRing/focusRing.support.ts',
        'src/forms/components/DrControl/DrControlFocusSpacing.support.ts',
        'src/forms/components/DrInput/DrInputMasking/playwright.support.ts',
      ],
    },
  },
  globalIgnores([
    'node_modules/**', 'dist/**', 'gallery-dist/**', 'coverage/**', '*.log',
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
    languageOptions: { globals: globals.node },
  },
  {
    name: 'dr-front/tooling-imports',
    files: ['*.config.ts', 'config/**/*.{js,ts}', 'scripts/**/*.ts'],
    rules: { '@typescript-eslint/no-restricted-imports': 'off' },
  },
);
