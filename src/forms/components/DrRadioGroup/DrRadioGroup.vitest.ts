import { expect, it, vi } from 'vitest';
import { createSSRApp, h, readonly, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import DrRadioGroup from '@/forms/components/DrRadioGroup/DrRadioGroup.vue';
import type { RadioGroupCheckedSlot, RadioGroupGalleryItem } from '@/forms/components/DrRadioGroup/types.support';

it.each(['same reference', 'Vue proxy', 'equal copy'])('SSR keeps radio and slot selection consistent for %s', async (selection) => {
  const items = [{ id: 1 }, { id: 1 }];
  const modelValue = selection === 'Vue proxy' ? readonly(ref(items[0]).value) : selection === 'same reference' ? items[0] : { ...items[0] };
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

  expect(radios).toEqual(expected);
  expect(slots).toEqual(expected);
  expect(update).not.toHaveBeenCalled();
});
