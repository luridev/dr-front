export const icons = ['arrow-left', 'check', 'chevron-down', 'chevron-up', 'close', 'plus-minus'] as const;
export const projectRootURL = new URL('../../', import.meta.url);
export const iconsSourcePath = 'src/assets/icons/system';
export const iconsOutputPath = 'src/icons/components';

export const iconPresentationAttributes = new Set([
  'fill',
  'fill-rule',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-opacity',
  'opacity',
  'vector-effect',
]);

export const unsupportedIconAttributes = new Set(['id', 'href', 'xlink:href', 'mask', 'clip-path', 'filter']);
