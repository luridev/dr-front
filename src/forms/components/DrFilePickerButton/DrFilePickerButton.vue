<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import DrButton from '@/actions/components/DrButton/DrButton.vue';
import { useDrTranslation } from '@/configuration/composables/useDrTranslation/useDrTranslation';
import type {
  DrFilePickerButtonEmits,
  DrFilePickerButtonProps,
} from '@/forms/components/DrFilePickerButton/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrFilePickerButtonProps>(), {
  disabled: false,
  loading: false,
});

const emit = defineEmits<DrFilePickerButtonEmits>();

const t = useDrTranslation();

const label = computed(() => props.label ?? t('filePicker.choose'));

const fileInputElement = useTemplateRef<HTMLInputElement>('fileInputElement');

function handleButtonClick(): void {
  if (props.disabled || props.loading) {
    return;
  }

  fileInputElement.value?.click();
}

function handleFileChange(event: Event): void {
  const input = event.currentTarget;

  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  const file = input.files?.item(0);

  input.value = '';

  if (file == null || props.disabled || props.loading) {
    return;
  }

  emit('select', file);
}
</script>

<template>
  <span
    class="DrFilePickerButton"
    :class="$attrs.class"
  >
    <input
      ref="fileInputElement"
      type="file"
      hidden
      :accept="props.accept"
      :disabled="props.disabled || props.loading"
      :aria-label="label"
      @change="handleFileChange"
    />

    <DrButton
      variant="ghost"
      size="small"
      :disabled="props.disabled || props.loading"
      :loading="props.loading"
      @click="handleButtonClick"
    >
      {{ label }}
    </DrButton>
  </span>
</template>

<style scoped>
  .DrFilePickerButton {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
  }
</style>
