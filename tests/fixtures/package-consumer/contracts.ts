import { DrButton, DrInput, DrInputDate, DrInputNumber, DrInputTime, DrTextarea, toast, useControlsState } from '@protoapps/dr-front';
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

const toastId: number = toast.info({ message: 'Typed consumer' });
const controls = useControlsState({ controls: { date: {} }, isValid: () => true });
const disabled: boolean = controls.controls.date.disabled;
const iconProps: InstanceType<typeof DrCloseIcon>['$props'] = { size: 16 };
const formatted: string = formatNumber(1234);

void [buttonProps, textProps, invalidText, numberProps, timeProps, dateProps, invalidDateProps, textareaProps, toastId, disabled, iconProps, formatted];
