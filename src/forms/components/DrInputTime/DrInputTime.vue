<script setup lang="ts">
import { computed } from 'vue';
import DrIconButton from '@/actions/components/DrIconButton/DrIconButton.vue';
import { useDrConfig } from '@/configuration/composables/useDrConfig/useDrConfig';
import { useDrTranslation } from '@/configuration/composables/useDrTranslation/useDrTranslation';
import { provideDrInputMask } from '@/forms/components/DrInput/composables/useDrInputMask/useDrInputMask';
import DrInput from '@/forms/components/DrInput/DrInput.vue';
import { useDrInputTimeModel } from '@/forms/components/DrInputTime/composables/useDrInputTimeModel/useDrInputTimeModel';
import { getTimeDrInputFormatSettings } from '@/forms/components/DrInputTime/config';
import { getInputLocaleProfile } from '@/forms/lib/getInputLocaleProfile/getInputLocaleProfile';
import { defaultTimeInputSmallestUnit } from '@/forms/lib/inputFormats/time/config';
import { isNonBlankString } from '@/strings/lib/isNonBlankString/isNonBlankString';
import type {
  DrInputTimeEmits,
  DrInputTimeProps,
  DrInputTimeSlots,
} from '@/forms/components/DrInputTime/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrInputTimeProps>(), {
  autocomplete: 'off',
  clearable: true,
  disabled: false,
  readonly: false,
  smallestUnit: defaultTimeInputSmallestUnit,
  state: 'normal',
});

const emit = defineEmits<DrInputTimeEmits>();

const model = defineModel<Temporal.PlainTime | null>({
  required: true,
});

defineSlots<DrInputTimeSlots>();

const config = useDrConfig();
const t = useDrTranslation();
const timeProfile = computed(() => getInputLocaleProfile(config.value.locale).time);

const {
  inputValue, updateInputValue, hourCycle, fractionalSecondSeparator, period, togglePeriod,
} = useDrInputTimeModel({
  model,
  profile: timeProfile,
  smallestUnit: () => props.smallestUnit,
  disabled: () => props.disabled || props.readonly,
  onStatusUpdate: (status) => {
    emit('update:status', status);
  },
});

provideDrInputMask(computed(() => props.smallestUnit === 'minute' || props.smallestUnit === 'second'
  ? getTimeDrInputFormatSettings(props.smallestUnit, hourCycle.value)
  : getTimeDrInputFormatSettings(props.smallestUnit, hourCycle.value, fractionalSecondSeparator.value)));

const periodLabel = computed(() => timeProfile.value.dayPeriods?.[period.value]);

const periodAriaLabel = computed(() => {
  const nextPeriod = period.value === 'am' ? 'pm' : 'am';
  const nextLabel = timeProfile.value.dayPeriods?.[nextPeriod] ?? '';

  return isNonBlankString(props.label)
    ? t('inputTime.switchPeriodNamed', { label: props.label.trim(), period: nextLabel })
    : t('inputTime.switchPeriod', { period: nextLabel });
});

function handlePeriodToggle() {
  togglePeriod();
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

      <DrIconButton
        v-if="hourCycle === 12"
        class="DrInputTime__periodButton"
        :disabled="props.disabled || props.readonly"
        :aria="{ ariaLabel: periodAriaLabel, ariaControls: inputId }"
        @pointerdown.prevent
        @click="handlePeriodToggle"
      >
        {{ periodLabel }}
      </DrIconButton>
    </template>
  </DrInput>
</template>

<style scoped>
  .DrInputTime__periodButton {
    flex: 0 0 auto;
    min-width: 44px;
    align-self: stretch;
    padding: 0 var(--dr-space-small);
    border-inline-start: 1px solid var(--dr-color-border-primary);
    background: transparent;
    color: var(--dr-color-text-secondary);
    font-size: var(--dr-font-size-medium);
    touch-action: manipulation;
  }

  .DrInputTime__periodButton:disabled {
    cursor: var(--dr-disabled-cursor);
    opacity: var(--dr-opacity-50);
  }

  .DrInputTime__periodButton:focus-visible {
    outline: 2px solid var(--dr-color-border-accent);
    outline-offset: -2px;
  }

  .DrInputTime__periodButton:hover:not(:disabled) {
    background: var(--dr-color-background-secondary);
    color: var(--dr-color-text-primary);
  }

  .DrInputTime__periodButton:active:not(:disabled) {
    opacity: var(--dr-opacity-65);
  }
</style>
