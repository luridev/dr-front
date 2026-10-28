<script setup lang="ts">
import { ref } from 'vue';
import { DrButton, DrInput } from '@/index';
import type { DrInputMaxLengthProps } from '@/forms/components/DrInput/DrInputMaxLength/types.support';

defineOptions({ inheritAttrs: false });

const props = defineProps<DrInputMaxLengthProps>();
const value = ref('');
const exceededLimit = ref<number>();
const limitExceededCount = ref(0);

function handleLimitExceeded(maxLength: number) {
  exceededLimit.value = maxLength;
  limitExceededCount.value += 1;
}

function replaceValue() {
  value.value = 'Longer parent value';
}
</script>

<template>
  <DrInput
    v-model="value"
    label="Limited input"
    :type="props.type"
    :max-length="props.maxLength"
    :readonly="props.readonly"
    :disabled="props.disabled"
    @limit-exceeded="handleLimitExceeded"
  />

  <DrButton @click="replaceValue">Replace from parent</DrButton>

  <p data-testid="model-value">{{ value }}</p>

  <p data-testid="exceeded-limit">{{ exceededLimit }}</p>

  <p data-testid="limit-exceeded-count">{{ limitExceededCount }}</p>
</template>
