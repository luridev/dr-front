export const publicRuntimeExports = [
  'DrFrontProvider', 'DrConfigProvider', 'DrButton', 'DrIconButton', 'DrOutput', 'DrAlert', 'DrToastHost', 'useDrToast',
  'DrCheckbox', 'DrControl', 'DrControlGroup', 'DrFilePickerButton',
  'DrInput', 'DrMaskedInput', 'DrInputDate', 'DrInputNumber', 'DrInputTime', 'DrRadioGroup', 'DrSelect', 'DrTextarea',
  'useControlsState', 'DrExpandableSection', 'DrGrid', 'DrGridItem', 'DrSection',
  'DrTabPanel', 'DrTabSwitcher', 'DrModalHost',
];

export const publicTypeExports = [
  'DrLanguage', 'DrLocale', 'DrFrontProviderProps', 'DrConfigProviderProps', 'DrMessageKey', 'DrTranslationRequest', 'DrTranslateOverride',
  'DrToastService', 'DrToastOptions', 'DrToastVariantOptions', 'DrToastVariant',
  'DrButtonVariant', 'DrButtonAria', 'DrAlertData', 'DrErrorAlertData', 'DrInputDateStatus', 'DrInputNumberStatus',
  'DrInputTimeSmallestUnit', 'DrInputTimeStatus', 'DrTextareaProps', 'DrTextareaEmits', 'DrTextareaExposed',
  'ControlStateDescriptor', 'DrMask', 'DrMaskedInputStatus', 'DrInputType',
];

export const publicIconExports = [
  'DrArrowLeftIcon', 'DrCheckIcon', 'DrChevronDownIcon', 'DrChevronUpIcon', 'DrCloseIcon', 'DrPlusMinusIcon',
];

export const publicEntrypoints = ['.', './icons', './styles.css'];

export const forbiddenRuntimeDependencies = ['temporal-polyfill'];

export const publishedFilePattern = /^(?:dist\/.+|package\.json|README[^/]*|LICENSE[^/]*)$/;
