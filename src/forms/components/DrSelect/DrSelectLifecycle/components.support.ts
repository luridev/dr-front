import { defineComponent, h, inject, onDeactivated, provide, ref, toRef, watch } from 'vue';
import DrSelect from '@/forms/components/DrSelect/DrSelect.vue';
import { keepAliveItems, lifecycleContextKey } from '@/forms/components/DrSelect/DrSelectLifecycle/config.support';
import type { PropType } from 'vue';
import type { LifecycleItem } from '@/forms/components/DrSelect/DrSelectLifecycle/types.support';
import type { DrSelectItemSlotProps } from '@/forms/components/DrSelect/types';

export const LocalProvider = defineComponent({
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  setup(props, { slots }) {
    provide(lifecycleContextKey, { value: toRef(props, 'value') });

    return () => slots.default?.();
  },
});

export const SlotContent = defineComponent({
  inheritAttrs: false,
  props: {
    details: { type: Object as PropType<DrSelectItemSlotProps<LifecycleItem>>, required: true },
    variant: { type: String, required: true },
    suffix: { type: String, required: true },
  },
  setup(props) {
    const context = inject(lifecycleContextKey, undefined);
    const localChanges = ref(0);

    watch(() => props.suffix, () => {
      localChanges.value += 1;
    });

    return () => h('span', {
      'data-testid': 'slot-content',
      'data-local-changes': localChanges.value,
      'data-index': props.details.index,
      'data-selected': props.details.selected,
      'data-active': props.details.active,
    }, `${props.variant}:${props.details.item.label}:${context?.value.value ?? 'MISSING'}:${props.suffix}`);
  },
});

export const CachedSelectOwner = defineComponent({
  inheritAttrs: false,
  props: { label: { type: String, required: true } },
  emits: ['deactivated'],
  setup(props, { emit }) {
    const selected = ref(keepAliveItems[0]);

    onDeactivated(() => {
      emit('deactivated');
    });

    return () => h(DrSelect<string>, {
      label: props.label,
      items: keepAliveItems,
      modelValue: selected.value,
      'onUpdate:modelValue': (value: string) => { selected.value = value; },
    });
  },
});
