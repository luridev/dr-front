export const publicRuntimeExports = [
  'DrConfigProvider', 'DrButton', 'DrIconButton', 'DrOutput', 'DrAlert', 'DrToastHost', 'useDrToast',
  'DrCheckbox', 'DrControl', 'DrControlGroup', 'DrFilePickerButton',
  'DrInput', 'DrMaskedInput', 'DrInputDate', 'DrInputNumber', 'DrInputTime', 'DrRadioGroup', 'DrSelect', 'DrTextarea',
  'useControlsState', 'DrExpandableSection', 'DrGrid', 'DrGridItem', 'DrSection',
  'DrTabPanel', 'DrTabSwitcher', 'DrModalHost',
];

export const publicTypeExports = [
  'DrLanguage', 'DrLocale', 'DrConfigProviderProps', 'DrMessageKey', 'DrTranslationRequest', 'DrTranslateOverride',
  'DrToastService', 'DrToastOptions', 'DrToastVariantOptions', 'DrToastVariant',
  'DrButtonVariant', 'DrButtonAria', 'DrAlertData', 'DrErrorAlertData', 'DrInputDateStatus',
  'DrInputTimeSmallestUnit', 'DrInputTimeStatus', 'DrTextareaProps', 'DrTextareaEmits', 'DrTextareaExposed',
  'ControlStateDescriptor', 'DrMask', 'DrMaskedInputStatus',
];

export const publicIconExports = [
  'DrArrowLeftIcon', 'DrCheckIcon', 'DrChevronDownIcon', 'DrChevronUpIcon', 'DrCloseIcon', 'DrPlusMinusIcon',
];

export const publicLibExports = ['formatFileSize', 'formatNumber'];
export const publicEntrypoints = ['.', './icons', './lib', './styles.css'];

export const forbiddenRuntimeDependencies = ['temporal-polyfill'];

export const publishedFilePattern = /^(?:dist\/.+|package\.json|README[^/]*|LICENSE[^/]*)$/;
