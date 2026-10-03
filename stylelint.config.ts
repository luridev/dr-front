import { createProtoConfig } from '@protoapps/stylelint-config';

export default createProtoConfig({
  config: {
    ignoreFiles: ['dist/**', 'gallery-dist/**', '.stryker-tmp/**'],
  },
});
