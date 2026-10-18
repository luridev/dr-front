import { defineComponent, h } from 'vue';
import { provideDrInputMask } from '@/forms/components/DrInput/composables/useDrInputMask/useDrInputMask';
import DrInput from '@/forms/components/DrInput/DrInput.vue';
import { numberDrInputFormatSettings } from '@/forms/components/DrInputNumber/config';
import { formatIntegerInputString } from '@/forms/lib/inputFormats/integer/integerInputFormat';

export const IntegerInput = defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: { type: String, required: true },
    label: String,
    readonly: Boolean,
    disabled: Boolean,
  },
  emits: { 'update:modelValue': (_value: string) => true },
  setup(props, { attrs, emit }) {
    provideDrInputMask({ ...numberDrInputFormatSettings, format: formatIntegerInputString });

    return () => h(DrInput, {
      ...attrs,
      ...props,
      'onUpdate:modelValue': (value: string) => {
        emit('update:modelValue', value);
      },
    });
  },
});
