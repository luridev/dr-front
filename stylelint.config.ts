import { createProtoConfig } from '@protoapps/stylelint-config';

export default createProtoConfig({
  config: {
    ignoreFiles: ['dist/**', 'gallery-dist/**', 'coverage/**', '.stryker-tmp/**', 'test-results/**', 'playwright-report/**', 'reports/**'],
  },
});
