import { defineComponent, h } from 'vue';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';

export const DialogContent = defineComponent({
  inheritAttrs: false,
  setup() {
    const items = Array.from({ length: 40 }, (_, index) => `Option ${index + 1}`);

    return () => [
      h('p', { class: 'DrSelectDialog__note' }, 'Choose an option below.'),
      h(DrSelect<string>, {
        class: 'DrSelectDialog__content',
        label: 'Dialog select',
        items,
        modelValue: 'Option 40',
      }),
      h('p', { class: 'DrSelectDialog__note' }, 'Scroll back to change your choice.'),
    ];
  },
});
