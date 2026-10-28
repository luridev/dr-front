import { expect, it, vi } from 'vitest';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import DrMaskedInput from '@/forms/components/DrMaskedInput/DrMaskedInput.vue';
import type { DrMask } from '@/forms/components/DrMaskedInput/types';

function prepareChar(value: string) {
  return value.replace(/[a-y]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 1));
}

it.each([
  ['123456', '000-000', '123-456'],
  ['1', { mask: Number, min: 5 }, '5'],
  ['ab', { mask: 'aaaa', prepareChar }, 'bc'],
] satisfies Array<[string, DrMask, string]>)('renders the normalized initial value %s without a DOM editor',
  async (modelValue, mask, display) => {
    const update = vi.fn();
    const status = vi.fn();

    const html = await renderToString(createSSRApp(() => h(DrMaskedInput, {
      modelValue,
      mask,
      'onUpdate:modelValue': update,
      'onUpdate:status': status,
    })));

    expect(html).toContain(`value="${display}"`);
    expect(update).not.toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });
