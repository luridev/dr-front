<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { DrFilePickerButton } from '@/index';

defineOptions({ inheritAttrs: false });

const selectedFile = shallowRef<File>();

const fileDescription = computed(() => {
  const file = selectedFile.value;

  return file == null ? 'No file selected' : `${file.name} · ${file.size} bytes`;
});

function handleSelect(file: File): void {
  selectedFile.value = file;
}
</script>

<template>
  <div class="GalleryExample">
    <div class="GalleryExample__row">
      <DrFilePickerButton
        label="Choose image"
        accept="image/*"
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

    <p class="GalleryExample__output">{{ fileDescription }}</p>
  </div>
</template>
