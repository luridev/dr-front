<script setup lang="ts">
import { computed, ref } from 'vue';
import { DrTextarea } from '@/index';
import type { DrTextareaPlaygroundProps } from '@/forms/components/DrTextarea/DrTextareaPlayground/types.support';
import type { DrTextareaMode } from '@/forms/components/DrTextarea/types';

const props = defineProps<DrTextareaPlaygroundProps>();
const text = ref('');
const exceededLimit = ref<number>();
const limitExceededCount = ref(0);
const mode = ref<DrTextareaMode>('content');
const kind = computed(() => (mode.value === 'content' ? 'group' : 'field'));

function updateText(value: string): void {
  text.value = value;
  mode.value = 'textarea';
}

function handleLimitExceeded(maxLength: number): void {
  exceededLimit.value = maxLength;
  limitExceededCount.value += 1;
}
</script>

<template>
  <DrTextarea
    :model-value="text"
    :mode="mode"
    :kind="kind"
    label="Source"
    :disabled="props.disabled"
    :state="props.state"
    :message="props.message"
    :max-length="props.maxLength"
    @update:model-value="updateText"
    @limit-exceeded="handleLimitExceeded"
  >
    <template #content="slot">
      <div
        :id="slot.id"
        role="group"
        :aria-labelledby="slot.labelId"
        :aria-describedby="slot.describedBy"
        :aria-invalid="slot.state === 'error' ? true : undefined"
        :aria-disabled="slot.disabled || undefined"
      >
        Custom content
      </div>
    </template>

    <template #actions="slot">
      <button
        type="button"
        data-testid="extra-action"
        :aria-controls="slot.id"
        :disabled="slot.disabled"
      >
        Extra action
      </button>
    </template>
  </DrTextarea>

  <p data-testid="model-text">{{ text }}</p>

  <p data-testid="exceeded-limit">{{ exceededLimit }}</p>

  <p data-testid="limit-exceeded-count">{{ limitExceededCount }}</p>
</template>
