import 'temporal-polyfill/global';
import { createSSRApp, h, shallowReactive } from 'vue';
import { DrConfigProvider, DrFrontProvider, DrInputDate, DrInputNumber, DrInputTime, DrMaskedInput, DrTextarea } from '@/index';
import type { DrTranslateOverride } from '@/configuration/types';
import type { LocalizationOptions, LocalizationState } from '~/tests/localization/types.support';

export function createLocalizationApp(options: LocalizationOptions) {
  const initialDate = Temporal.PlainDate.from('2026-12-31');
  const initialTime = Temporal.PlainTime.from('23:45:56.123456789');

  const state = shallowReactive<LocalizationState>({
    language: options.language,
    locale: options.locale,
    number: 1234567,
    date: initialDate,
    time: initialTime,
    masked: '-1234567',
    textarea: 'x'.repeat(1234),
    numberUpdates: 0,
    dateUpdates: 0,
    timeUpdates: 0,
    maskedUpdates: 0,
    textareaUpdates: 0,
    dateStatus: '',
    timeStatus: '',
  });

  const translate: DrTranslateOverride = ({ key, language }) => key === 'input.clearNamed' ? `Custom clear (${language})` : undefined;

  const fields = () => h('div', [
    h(DrInputNumber, {
      modelValue: state.number,
      label: 'Number',
      'onUpdate:modelValue': (value: number | null) => {
        state.number = value;
        state.numberUpdates += 1;
      },
    }),
    h(DrInputDate, {
      modelValue: state.date,
      label: 'Date',
      'onUpdate:modelValue': (value: Temporal.PlainDate | null) => {
        state.date = value;
        state.dateUpdates += 1;
      },
      'onUpdate:status': (status: string) => { state.dateStatus = status; },
    }),
    h(DrInputTime, {
      modelValue: state.time,
      label: 'Time',
      'onUpdate:modelValue': (value: Temporal.PlainTime | null) => {
        state.time = value;
        state.timeUpdates += 1;
      },
      'onUpdate:status': (status: string) => { state.timeStatus = status; },
    }),
    h(DrMaskedInput, {
      modelValue: state.masked,
      label: 'Masked integer',
      mask: { type: 'integer' },
      'onUpdate:modelValue': (value: string) => {
        state.masked = value;
        state.maskedUpdates += 1;
      },
    }),
    h(DrTextarea, {
      modelValue: state.textarea,
      label: 'Textarea',
      maxLength: 1500,
      clearable: false,
      'onUpdate:modelValue': (value: string) => {
        state.textarea = value;
        state.textareaUpdates += 1;
      },
    }),
    h('output', { 'data-testid': 'models', 'data-updates': [state.numberUpdates, state.dateUpdates, state.timeUpdates, state.maskedUpdates].join(',') }, `${state.number}|${String(state.date)}|${String(state.time)}|${state.masked}`),
    h('output', { 'data-testid': 'identity' }, `${state.date === initialDate},${state.time === initialTime}`),
  ]);

  const app = createSSRApp({
    setup() {
      return () => {
        if (options.provider === 'none') {
          return fields();
        }

        const props = { language: state.language, locale: state.locale };

        const content = options.nested === true
          ? () => h(DrFrontProvider, { translate: () => undefined }, {
              default: () => h(DrConfigProvider, { language: 'en' }, { default: fields }),
            })
          : fields;

        return options.provider === 'config' || options.nested === true
          ? h(DrConfigProvider, {
              ...props, translate: options.nested === true ? translate : undefined,
            }, { default: content })
          : h(DrFrontProvider, props, { default: content });
      };
    },
  });

  return { app, state };
}
