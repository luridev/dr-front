import { createProtoConfig } from '@protoapps/stylelint-config';

export default createProtoConfig({
  config: {
    ignoreFiles: ['dist/**', '.stryker-tmp/**'],
  },
});
