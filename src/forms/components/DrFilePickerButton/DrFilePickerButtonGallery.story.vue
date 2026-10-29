<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { DrFilePickerButton } from '@/index';
import type { DrFilePickerButtonGalleryProps } from '@/forms/components/DrFilePickerButton/types.support';

defineOptions({ inheritAttrs: false });

const props = defineProps<DrFilePickerButtonGalleryProps>();
const selectedFile = shallowRef<File>();
const selectionCount = ref(0);
const isNativeFile = computed(() => selectedFile.value instanceof File);

const fileDescription = computed(() => {
  const file = selectedFile.value;

  return file == null ? 'No file selected' : `${file.name} · ${file.size} bytes`;
});

function handleSelect(file: File): void {
  selectedFile.value = file;
  selectionCount.value += 1;
}
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__row">
      <DrFilePickerButton
        label="Choose image"
        accept="image/*"
        :disabled="props.disabled"
        :loading="props.loading"
        @select="handleSelect"
      />

      <DrFilePickerButton
        label="Choose file"
        @select="handleSelect"
      />

      <DrFilePickerButton
        label="Disabled"
        disabled
      />

      <DrFilePickerButton
        label="Loading…"
        loading
      />
    </div>

    <p
      class="GalleryExample__output"
      data-testid="selected-file"
      :data-selections="selectionCount"
      :data-native-file="isNativeFile"
      :data-file-type="selectedFile?.type"
    >{{ fileDescription }}</p>
  </div>
</template>
