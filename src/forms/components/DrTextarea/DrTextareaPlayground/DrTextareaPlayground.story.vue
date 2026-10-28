<script setup lang="ts">
import { computed, ref } from 'vue';
import { DrTextarea } from '@/index';
import type { DrTextareaPlaygroundProps } from '@/forms/components/DrTextarea/DrTextareaPlayground/types.support';
import type { DrTextareaMode } from '@/forms/components/DrTextarea/types';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrTextareaPlaygroundProps>(), {
  spellCheck: undefined,
});

const text = ref('');
const exceededLimit = ref<number>();
const limitExceededCount = ref(0);
const focusCount = ref(0);
const hasNativeFocusTarget = ref(false);
const editorMode = ref<DrTextareaMode>('content');
const effectiveMode = computed(() => props.mode ?? editorMode.value);
const kind = computed(() => props.kind ?? (effectiveMode.value === 'content' ? 'group' : 'field'));

function updateText(value: string): void {
  text.value = value;
  editorMode.value = 'textarea';
}

function handleLimitExceeded(maxLength: number): void {
  exceededLimit.value = maxLength;
  limitExceededCount.value += 1;
}

function handleFocus(event: FocusEvent): void {
  focusCount.value += 1;

  hasNativeFocusTarget.value = event instanceof FocusEvent &&
    event.target instanceof HTMLTextAreaElement && event.currentTarget === event.target;
}
</script>

<template>
  <DrTextarea
    :model-value="text"
    :mode="effectiveMode"
    :kind="kind"
    label="Source"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :state="props.state"
    :message="props.message"
    :max-length="props.maxLength"
    :input-mode="props.inputMode"
    :enter-key-hint="props.enterKeyHint"
    :spell-check="props.spellCheck"
    :auto-capitalize="props.autoCapitalize"
    :auto-correct="props.autoCorrect"
    @focus="handleFocus"
    @update:model-value="updateText"
    @limit-exceeded="handleLimitExceeded"
  >
    <template #content="slot">
      <div
        :id="slot.id"
        role="group"
        :aria-labelledby="slot.labelId"
        :aria-describedby="slot.describedBy"
        :aria-invalid="slot.state === 'error' || undefined"
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

  <p data-testid="focus-count">{{ focusCount }}</p>

  <p data-testid="native-focus-target">{{ hasNativeFocusTarget }}</p>
</template>
