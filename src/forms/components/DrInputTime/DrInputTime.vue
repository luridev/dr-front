<script setup lang="ts">
import { computed } from 'vue';
import { provideDrInputInternalFormat } from '@/forms/components/DrInput/composables/useDrInputInternalFormat/useDrInputInternalFormat';
import { useDrTypedInputModel } from '@/forms/components/DrInput/composables/useDrTypedInputModel/useDrTypedInputModel';
import DrInput from '@/forms/components/DrInput/DrInput.vue';
import { timeDrInputFormatSettingsBySmallestUnit } from '@/forms/components/DrInputTime/config';
import { defaultTimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/config';
import {
  parseTimeInputValue,
  stringifyTimeInputValue,
} from '@/forms/lib/inputFormats/time/timeInputFormat';
import type { DrTypedInputStatus } from '@/forms/components/DrInput/composables/useDrTypedInputModel/types';
import type {
  DrInputTimeEmits,
  DrInputTimeProps,
  DrInputTimeSlots,
  DrInputTimeSmallestUnit,
  DrInputTimeStatus,
} from '@/forms/components/DrInputTime/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrInputTimeProps>(), {
  autocomplete: 'off',
  clearable: true,
  disabled: false,
  smallestUnit: defaultTimeInputSmallestUnit,
  state: 'normal',
});

const emit = defineEmits<DrInputTimeEmits>();

const model = defineModel<Temporal.PlainTime | null>({
  required: true,
});

defineSlots<DrInputTimeSlots>();

const internalFormat = computed(() => timeDrInputFormatSettingsBySmallestUnit[props.smallestUnit]);

provideDrInputInternalFormat(internalFormat);

const { inputValue, updateInputValue } = useDrTypedInputModel<
  Temporal.PlainTime,
  Exclude<DrInputTimeStatus, DrTypedInputStatus>,
  DrInputTimeSmallestUnit
>({
  model,
  formatSource: () => props.smallestUnit,
  parse: (value) => parseTimeInputValue(value, props.smallestUnit),
  stringify: (value) => stringifyTimeInputValue(value, props.smallestUnit),
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
