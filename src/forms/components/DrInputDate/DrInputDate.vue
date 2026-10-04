<script setup lang="ts">
import { provideDrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/useDrInputInternalFormat';
import { useDrTypedInputModel } from '@/forms/components/DrInput/composables/useDrTypedInputModel/useDrTypedInputModel';
import DrInput from '@/forms/components/DrInput/DrInput.vue';
import { dateDrInputFormatSettings } from '@/forms/components/DrInputDate/config';
import {
  parseDateInputValue,
  stringifyDateInputValue,
} from '@/forms/lib/inputFormats/date/dateInputFormat';
import type { DrTypedInputStatus } from '@/forms/components/DrInput/composables/useDrTypedInputModel/types';
import type {
  DrInputDateEmits,
  DrInputDateProps,
  DrInputDateSlots,
  DrInputDateStatus,
} from '@/forms/components/DrInputDate/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrInputDateProps>(), {
  autocomplete: 'off',
  clearable: true,
  disabled: false,
  readonly: false,
  state: 'normal',
});

const emit = defineEmits<DrInputDateEmits>();

const model = defineModel<Temporal.PlainDate | null>({
  required: true,
});

defineSlots<DrInputDateSlots>();

provideDrInputInternalFormat(dateDrInputFormatSettings);

const { inputValue, updateInputValue } = useDrTypedInputModel<
  Temporal.PlainDate,
  Exclude<DrInputDateStatus, DrTypedInputStatus>
>({
  model,
  parse: parseDateInputValue,
  stringify: stringifyDateInputValue,
  equals: (first, second) => first.equals(second),
  onStatusUpdate: (status) => {
    emit('update:status', status);
  },
});

function handleBlur(event: FocusEvent) {
  emit('blur', event);
}
</script>

<template>
  <DrInput
    :class="$attrs.class"
    :model-value="inputValue"
    :label="props.label"
    :label-position="props.labelPosition"
    :placeholder="props.placeholder"
    :clearable="props.clearable"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :state="props.state"
    :message="props.message"
    :autocomplete="props.autocomplete"
    :aria="props.aria"
    @update:model-value="updateInputValue"
    @blur="handleBlur"
  >
    <template #label>
      <slot name="label">
        {{ props.label }}
      </slot>
    </template>

    <template #start="{ inputId }">
      <slot
        name="start"
        :input-id="inputId"
      ></slot>
    </template>

    <template #end="{ inputId }">
      <slot
        name="end"
        :input-id="inputId"
      ></slot>
    </template>
  </DrInput>
</template>
