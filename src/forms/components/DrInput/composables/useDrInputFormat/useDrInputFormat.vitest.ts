import { describe, expect, it } from 'vitest';
import { computed, createSSRApp, defineComponent, h, ref, shallowRef } from 'vue';
import { renderToString } from 'vue/server-renderer';
import {
  defaultDrInputFormatSettings,
  integerDrInputFormatSettings,
} from '@/forms/components/DrInput/composables/useDrInputFormat/config';
import { useDrInputFormat } from '@/forms/components/DrInput/composables/useDrInputFormat/useDrInputFormat';
import { provideDrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/useDrInputInternalFormat';
import type { Component } from 'vue';
import type {
  DrInputInternalFormat,
  DrInputInternalFormatSource,
} from '@/forms/components/DrInput/composables/useDrInputInternalFormat/types';
import type { DrInputFormat } from '@/forms/lib/inputFormats/types';

function createFormatProbe(inputFormat = ref<DrInputFormat>()) {
  const results = new Map<string, ReturnType<typeof useDrInputFormat>>();

  const Input = defineComponent({
    props: { name: { type: String, required: true } },
    setup(props, { slots }) {
      results.set(props.name, useDrInputFormat({ inputFormat }));

      return () => h('div', slots.default?.());
    },
  });

  function provider(source: DrInputInternalFormatSource): Component {
    return defineComponent({
      setup(_props, { slots }) {
        provideDrInputInternalFormat(source);

        return () => slots.default?.();
      },
    });
  }

  function settings(name = 'input') {
    const result = results.get(name);

    if (result == null) {
      throw new Error(`Input probe was not rendered: ${name}`);
    }

    return {
      maskitoOptions: result.maskitoOptions.value,
      inputMode: result.inputMode.value,
    };
  }

  return { Input, provider, settings };
}

const textFormat = {
  maskitoOptions: { mask: /^[a-z]*$/ },
  inputMode: 'text',
} satisfies DrInputInternalFormat;

describe('useDrInputFormat', () => {
  it('использует default settings без provider и public format', async () => {
    const { Input, settings } = createFormatProbe();

    await renderToString(createSSRApp(() => h(Input, { name: 'input' })));

    expect(settings()).toEqual(defaultDrInputFormatSettings);
  });

  it('реактивно выбирает public integer и возвращается к обычному input', async () => {
    const publicFormat = ref<DrInputFormat>();
    const { Input, settings } = createFormatProbe(publicFormat);

    await renderToString(createSSRApp(() => h(Input, { name: 'input' })));

    publicFormat.value = { type: 'integer' };
    expect(settings()).toEqual(integerDrInputFormatSettings);
    expect(settings().maskitoOptions).toBe(integerDrInputFormatSettings.maskitoOptions);

    publicFormat.value = undefined;
    expect(settings()).toEqual(defaultDrInputFormatSettings);
  });

  it('выбирает injected settings целиком вместо public integer', async () => {
    const { Input, provider, settings } = createFormatProbe(ref({ type: 'integer' }));
    const Provider = provider(textFormat);

    await renderToString(createSSRApp(() => h(Provider, null, () => h(Input, { name: 'input' }))));

    expect(settings()).toEqual(textFormat);
    expect(settings().maskitoOptions).toBe(textFormat.maskitoOptions);
  });

  it('не заменяет явную internal null mask публичной маской', async () => {
    const internalFormat = { maskitoOptions: null, inputMode: 'text' } satisfies DrInputInternalFormat;
    const { Input, provider, settings } = createFormatProbe(ref({ type: 'integer' }));
    const Provider = provider(internalFormat);

    await renderToString(createSSRApp(() => h(Provider, null, () => h(Input, { name: 'input' }))));

    expect(settings()).toEqual(internalFormat);
  });

  it('сохраняет реактивную связь с предоставленным computed source', async () => {
    const value = shallowRef<DrInputInternalFormat>(textFormat);
    const source = computed(() => value.value);
    const { Input, provider, settings } = createFormatProbe();
    const Provider = provider(source);

    await renderToString(createSSRApp(() => h(Provider, null, () => h(Input, { name: 'input' }))));

    expect(settings().maskitoOptions).toBe(textFormat.maskitoOptions);

    value.value = integerDrInputFormatSettings;
    expect(settings()).toEqual(integerDrInputFormatSettings);
    expect(settings().maskitoOptions).toBe(integerDrInputFormatSettings.maskitoOptions);
  });

  it('сбрасывает наследование для потомков, сохраняя source у самого input и sibling', async () => {
    const { Input, provider, settings } = createFormatProbe();
    const Provider = provider(textFormat);

    await renderToString(createSSRApp(() => h(Provider, null, () => [
      h(Input, { name: 'parent' }, () => h(Input, { name: 'slot' })),
      h(Input, { name: 'sibling' }),
    ])));

    expect(settings('parent')).toEqual(textFormat);
    expect(settings('sibling')).toEqual(textFormat);
    expect(settings('slot')).toEqual(defaultDrInputFormatSettings);
  });

  it('применяет ближайший nested provider и снова изолирует его descendants', async () => {
    const { Input, provider, settings } = createFormatProbe();
    const Outer = provider(textFormat);
    const Inner = provider(integerDrInputFormatSettings);

    await renderToString(createSSRApp(() => h(Outer, null, () =>
      h(Input, { name: 'outer' }, () =>
        h(Inner, null, () => h(Input, { name: 'inner' }, () => h(Input, { name: 'slot' }))),
      ),
    )));

    expect(settings('outer')).toEqual(textFormat);
    expect(settings('inner')).toEqual(integerDrInputFormatSettings);
    expect(settings('slot')).toEqual(defaultDrInputFormatSettings);
  });
});
