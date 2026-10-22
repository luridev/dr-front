import { computed, readonly, ref, toValue, watch } from 'vue';
import { useDrTypedInputModel } from '@/forms/components/DrInput/composables/useDrTypedInputModel/useDrTypedInputModel';
import {
  getTimeInputDayPeriod,
  parseTimeInputValue,
  retainTimeInputPrecision,
  stringifyTimeInputValue,
} from '@/forms/lib/inputFormats/time/timeInputFormat';
import type { UseDrInputTimeModelParams } from '@/forms/components/DrInputTime/composables/useDrInputTimeModel/types';
import type { TimeInputDayPeriod } from '@/forms/lib/inputFormats/time/types';

export function useDrInputTimeModel({
  model, profile, smallestUnit, disabled, onStatusUpdate,
}: UseDrInputTimeModelParams) {
  const hourCycle = computed(() => toValue(profile).dayPeriods === null ? 24 : toValue(profile).hourCycle);
  const unit = computed(() => toValue(smallestUnit));
  const period = ref<TimeInputDayPeriod>('am');

  watch(model, (value) => {
    if (value !== null) {
      period.value = getTimeInputDayPeriod(value);
    }
  }, { immediate: true, flush: 'sync' });

  const { inputValue, updateInputValue } = useDrTypedInputModel<Temporal.PlainTime>({
    model,
    formatSource: computed(() => `${hourCycle.value}:${unit.value}`),
    parse: (value) => parseTimeInputValue(value, unit.value, hourCycle.value, period.value),
    stringify: (value) => stringifyTimeInputValue(value, unit.value, hourCycle.value),
    equals: (first, second) => first.equals(second),
    merge: (value, previous) => retainTimeInputPrecision(value, previous, unit.value),
    onStatusUpdate,
  });

  function togglePeriod() {
    if (hourCycle.value !== 12 || toValue(disabled)) {
      return;
    }

    period.value = period.value === 'am' ? 'pm' : 'am';
    updateInputValue(inputValue.value);
  }

  return { inputValue, updateInputValue, hourCycle, period: readonly(period), togglePeriod };
}
