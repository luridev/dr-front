import { DrConfigProvider, DrButton, DrInput, DrMaskedInput, DrInputDate, DrInputNumber, DrInputTime, DrTextarea, useDrToast, useControlsState } from '@protoapps/dr-front';
import type { DrConfigProviderProps, DrLanguage, DrLocale, DrMessageKey, DrTranslationRequest, DrTranslateOverride, DrMask, DrMaskedInputStatus, DrToastService, DrToastOptions, DrToastVariantOptions, DrToastVariant } from '@protoapps/dr-front';
import { DrCloseIcon } from '@protoapps/dr-front/icons';
import { formatNumber } from '@protoapps/dr-front/lib';

declare const button: InstanceType<typeof DrButton>;
const buttonProps: typeof button.$props = { variant: 'outline', size: 'small', state: 'warning' };

button.$emit('click', new MouseEvent('click'));
// @ts-expect-error Click events must retain their MouseEvent payload.
button.$emit('click', 'invalid');

declare const dateInput: InstanceType<typeof DrInputDate>;
declare const textInput: InstanceType<typeof DrInput>;
const textProps: typeof textInput.$props = { modelValue: 'text' };
textInput.focus({ preventScroll: true });
textInput.setCaretToEnd();
textInput.$emit('update:modelValue', 'next');
// @ts-expect-error Text models must remain strings.
const invalidText: typeof textInput.$props = { modelValue: 123 };

declare const numberInput: InstanceType<typeof DrInputNumber>;
declare const maskedInput: InstanceType<typeof DrMaskedInput>;
const masks = ['000-000', { pattern: 'HH-0000', definitions: { H: /[A-F0-9]/ } }, { type: 'integer' }] as const satisfies ReadonlyArray<DrMask>;
const maskedProps: typeof maskedInput.$props = { modelValue: '123456', mask: masks[0] };
maskedInput.$emit('update:modelValue', '123');
maskedInput.$emit('update:status', 'incomplete' satisfies DrMaskedInputStatus);
maskedInput.focus({ preventScroll: true });
maskedInput.setCaretToEnd();
// @ts-expect-error Masked string models must not accept numbers.
maskedInput.$emit('update:modelValue', 42);
// @ts-expect-error Only Pattern and Integer masks are public.
const invalidMask: DrMask = { type: 'number', scale: 2 };
const numberProps: typeof numberInput.$props = { modelValue: 42, min: 0, max: 100, step: 2 };
// @ts-expect-error Number models must not accept strings.
numberInput.$emit('update:modelValue', '42');
declare const timeInput: InstanceType<typeof DrInputTime>;
const timeProps: typeof timeInput.$props = { modelValue: null, smallestUnit: 'nanosecond' };
// @ts-expect-error Time models must not accept strings.
timeInput.$emit('update:modelValue', '12:34');
declare const date: Temporal.PlainDate | null;
const dateProps: typeof dateInput.$props = { modelValue: date };

dateInput.$emit('update:modelValue', date);
// @ts-expect-error Date models must not accept strings.
const invalidDateProps: typeof dateInput.$props = { modelValue: 'invalid' };
// @ts-expect-error Date update events must retain their model type.
dateInput.$emit('update:modelValue', 'invalid');

declare const textarea: InstanceType<typeof DrTextarea>;
const textareaProps: typeof textarea.$props = { modelValue: 'text', maxLength: 50 };

textarea.$emit('update:modelValue', 'next');
textarea.$emit('limitExceeded', 50);
textarea.focus();
textarea.focus({ preventScroll: true });
// @ts-expect-error Exposed focus must retain its typed options.
textarea.focus('invalid');

const useToast: () => DrToastService = useDrToast;
declare const toast: DrToastService;
const variant: DrToastVariant = 'error';
const toastOptions: DrToastOptions = { variant, message: 'Typed toast' };
const variantOptions: DrToastVariantOptions = { title: 'Title', message: 'Typed variant', duration: 1000 };
const toastId: number = toast.info({ message: 'Typed consumer' });
const controls = useControlsState({ controls: { date: {} }, isValid: () => true });
const disabled: boolean = controls.controls.date.disabled;
const iconProps: InstanceType<typeof DrCloseIcon>['$props'] = { size: 16 };
const formatted: string = formatNumber(1234);

const language: DrLanguage = 'ru';
const locale: DrLocale = 'en-GB';
const key: DrMessageKey = 'input.clearNamed';
const request: DrTranslationRequest = { language, key, params: { label: 'Email' } };
const translate: DrTranslateOverride = (request) => {
  if (request.key === 'input.clearNamed') {
    const label: string = request.params.label;
    // @ts-expect-error The narrowed parameters expose only the known names.
    request.params.name;
    return `Reset ${label}`;
  }
  if (request.key === 'dialog.close') {
    const absent: undefined = request.params;
    // @ts-expect-error Parameterless messages cannot supply a label.
    const unexpected: { label: string } = request.params;
    void [absent, unexpected];
    return request.language === 'en' ? 'Dismiss' : undefined;
  }
  return undefined;
};
const destructured: DrTranslateOverride = ({ key, params }) => key === 'input.clearNamed' ? params.label : undefined;
const config: DrConfigProviderProps = { language, locale, translate };
const providerProps: InstanceType<typeof DrConfigProvider>['$props'] = config;
translate(request);
translate({ language: 'en', key: 'dialog.close' });
// @ts-expect-error Unsupported languages are not public extensions.
const badLanguage: DrLanguage = 'de';
// @ts-expect-error Locale support is explicit, not every Intl locale.
const badLocale: DrLocale = 'en-AU';
// @ts-expect-error Provider component declarations retain the language union.
const badProvider: InstanceType<typeof DrConfigProvider>['$props'] = { language: 'de' };
// @ts-expect-error Unknown request keys are rejected.
translate({ language: 'en', key: 'unknown.key' });
// @ts-expect-error Unknown request languages are rejected.
translate({ language: 'de', key: 'dialog.close' });
// @ts-expect-error Parameterized messages require params.
translate({ language: 'en', key: 'input.clearNamed' });
// @ts-expect-error Parameter types follow the English function signature.
translate({ language: 'en', key: 'input.clearNamed', params: { label: 42 } });
// @ts-expect-error Parameterless messages must not have an artificial params object.
translate({ language: 'en', key: 'dialog.close', params: {} });
// @ts-expect-error Additional parameter names are rejected.
translate({ language: 'en', key: 'input.clearNamed', params: { label: 'Email', extra: 'value' } });
// @ts-expect-error Only a string or undefined may be returned.
const badTranslate: DrTranslateOverride = () => null;

void [destructured, providerProps, badLanguage, badLocale, badProvider, badTranslate, useToast, toastOptions, variantOptions, buttonProps, textProps, invalidText, maskedProps, invalidMask, numberProps, timeProps, dateProps, invalidDateProps, textareaProps, toastId, disabled, iconProps, formatted];
