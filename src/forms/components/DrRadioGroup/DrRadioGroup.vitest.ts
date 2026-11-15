import { describe, expect, it, vi } from 'vitest';
import { createSSRApp, h, readonly, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import DrRadioGroup from '@/forms/components/DrRadioGroup/DrRadioGroup.vue';
import type { RadioGroupCheckedSlot, RadioGroupGalleryItem } from '@/forms/components/DrRadioGroup/types.support';

describe('DrRadioGroup', () => {
  it.each(['same reference', 'Vue proxy', 'equal copy'])('SSR keeps radio and slot selection consistent for %s', async (selection) => {
    const first = { id: 1 };
    const second = { id: 1 };
    const items = [first, second];
    const modelValue = selection === 'Vue proxy' ? readonly(ref(first).value) : selection === 'same reference' ? first : { ...first };
    const update = vi.fn();

    const html = await renderToString(createSSRApp(() => h(DrRadioGroup<RadioGroupGalleryItem>, {
      items,
      modelValue,
      'onUpdate:modelValue': update,
    }, {
      item: ({ checked }: RadioGroupCheckedSlot) => h('span', { 'data-slot-checked': String(checked) }),
    })));

    const expected = [selection !== 'equal copy', false];
    const radios = [...html.matchAll(/<input\b[^>]*>/g)].map(([input]) => /\schecked(?:[\s=>])/.test(input));
    const slots = [...html.matchAll(/data-slot-checked="(true|false)"/g)].map(([, checked]) => checked === 'true');

    expect(radios).toStrictEqual(expected);
    expect(slots).toStrictEqual(expected);
    expect(update).not.toHaveBeenCalled();
  });
});
