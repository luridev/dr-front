<script setup lang="ts">
import { useTemplateRef } from 'vue';
import type {
  DrTextareaBaseEmits,
  DrTextareaBaseProps,
  DrTextareaBaseResize,
} from '@/forms/components/DrTextareaBase/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrTextareaBaseProps>(), {
  disabled: false,
  rows: 5,
  resize: 'none',
});

const emit = defineEmits<DrTextareaBaseEmits>();

const model = defineModel<string>({ required: true });

const textareaElement = useTemplateRef<HTMLTextAreaElement>('textareaElement');

const resizeClasses = {
  none: 'DrTextareaBase_resize_none',
  vertical: 'DrTextareaBase_resize_vertical',
} as const satisfies Record<DrTextareaBaseResize, string>;

function handleBlur(event: FocusEvent) {
  emit('blur', event);
}

function focus(options?: FocusOptions): void {
  textareaElement.value?.focus(options);
}

function handlePaste(event: ClipboardEvent) {
  if (props.maxLength == null) {
    return;
  }

  const pastedText = event.clipboardData?.getData('text/plain');

  if (pastedText == null) {
    return;
  }

  const textarea = event.currentTarget;

  if (!(textarea instanceof HTMLTextAreaElement)) {
    return;
  }

  const selectedTextLength = textarea.selectionEnd - textarea.selectionStart;
  const nextLength = textarea.value.length - selectedTextLength + pastedText.length;

  if (nextLength <= props.maxLength) {
    return;
  }

  event.preventDefault();
  emit('limitExceeded', props.maxLength);
}

defineExpose({
  focus,
});
</script>

<template>
  <textarea
    :id="props.id"
    ref="textareaElement"
    v-model="model"
    class="DrTextareaBase"
    :class="[resizeClasses[props.resize], $attrs.class]"
    :placeholder="props.placeholder"
    :rows="props.rows"
    :maxlength="props.maxLength"
    :disabled="props.disabled"
    :aria-invalid="props.aria?.ariaInvalid || undefined"
    :aria-describedby="props.aria?.ariaDescribedBy"
    @blur="handleBlur"
    @paste="handlePaste"
  ></textarea>
</template>

<style scoped>
  .DrTextareaBase {
    display: block;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: var(--dr-space-small) var(--dr-space-medium);
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }

  .DrTextareaBase:disabled {
    cursor: var(--dr-disabled-cursor);
  }

  .DrTextareaBase_resize_none {
    resize: none;
  }

  .DrTextareaBase_resize_vertical {
    resize: vertical;
  }
</style>
