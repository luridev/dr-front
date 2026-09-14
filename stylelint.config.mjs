/** @type {import('stylelint').Config} */

const internalClassPattern = '[A-Za-z][A-Za-z0-9_]*';
const vueTransitionClassPattern = `${internalClassPattern}-(?:enter|leave)-(?:from|active|to)`;
const selectorClassPatterns = [internalClassPattern, vueTransitionClassPattern];
const selectorClassPattern = `^(?:${selectorClassPatterns.join('|')})$`;

export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['node_modules/**', 'dist/**', 'coverage/**', 'reports/**', '.stryker-tmp/**'],
  overrides: [{ files: ['**/*.vue'], extends: ['stylelint-config-standard-vue'] }],
  rules: {
    'selector-class-pattern': selectorClassPattern,
    'color-hex-length': 'long',
    'custom-property-empty-line-before': null,
  },
};
