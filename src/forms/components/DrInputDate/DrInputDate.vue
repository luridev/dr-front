<script setup lang="ts">
import { computed } from 'vue';
import { useDrConfig } from '@/configuration/composables/useDrConfig/useDrConfig';
import { provideDrInputMask } from '@/forms/components/DrInput/composables/useDrInputMask/useDrInputMask';
import { useDrTypedInputModel } from '@/forms/components/DrInput/composables/useDrTypedInputModel/useDrTypedInputModel';
import DrInput from '@/forms/components/DrInput/DrInput.vue';
import { getDateDrInputFormatSettings } from '@/forms/components/DrInputDate/config';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
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

const config = useDrConfig();
const dateProfile = computed(() => getInputLocaleProfile(config.value.locale).date);

provideDrInputMask(computed(() => getDateDrInputFormatSettings(dateProfile.value)));

const { inputValue, updateInputValue } = useDrTypedInputModel<
  Temporal.PlainDate,
  Exclude<DrInputDateStatus, DrTypedInputStatus>
>({
  model,
  formatSource: dateProfile,
  parse: (value) => parseDateInputValue(value, dateProfile.value),
  stringify: (value) => stringifyDateInputValue(value, dateProfile.value),
  equals: (first, second) => first.equals(second),
  onStatusUpdate: (status) => {
    emit('update:status', status);
  },
});

function handleFocus(event: FocusEvent) {
  emit('focus', event);
}

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
    :input-mode="props.inputMode"
    :enter-key-hint="props.enterKeyHint"
    :aria="props.aria"
    @update:model-value="updateInputValue"
    @focus="handleFocus"
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
