<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { DrButton, DrTextarea } from '@/index';
import type { DrTextareaExposed } from '@/index';

defineOptions({ inheritAttrs: false });

const text = ref('A short note for the team.');
const readonlyText = ref('This note is read-only.');
const preview = ref('');
const errorText = ref('');
const disabledText = ref('This note is disabled.');
const limitMessage = ref('120 characters max');
const note = useTemplateRef<DrTextareaExposed>('note');

function handleExample(): void {
  text.value = 'Meet at 10:00 to review the new components.';
}

function handleLimitExceeded(limit: number): void {
  limitMessage.value = `${limit}-character limit reached`;
}

function handleClear(): void {
  text.value = '';
  note.value?.focus();
}

function handlePreview(): void {
  preview.value = readonlyText.value;
}

function handleRefresh(): void {
  readonlyText.value = 'Updated by the parent.';
}
</script>

<template>
  <div class="GalleryExample">
    <DrTextarea
      ref="note"
      v-model="text"
      label="Note"
      :rows="4"
      :max-length="120"
      :clearable="false"
      :message="limitMessage"
      @limit-exceeded="handleLimitExceeded"
    >
      <template #actions="slot">
        <DrButton
          variant="ghost"
          size="small"
          :disabled="slot.disabled || slot.readonly"
          @click="handleExample"
        >Insert example</DrButton>

        <DrButton
          v-if="text !== ''"
          variant="ghost"
          size="small"
          :disabled="slot.disabled || slot.readonly"
          @click="handleClear"
        >Clear</DrButton>
      </template>
    </DrTextarea>

    <div class="GalleryExample__grid">
      <DrTextarea
        v-model="readonlyText"
        label="Read-only"
        :rows="3"
        readonly
        message="Select or read the text; editing actions are unavailable."
      >
        <template #actions="slot">
          <DrButton
            variant="ghost"
            size="small"
            :disabled="slot.disabled"
            @click="handlePreview"
          >Show value</DrButton>

          <DrButton
            variant="ghost"
            size="small"
            :disabled="slot.disabled || slot.readonly"
            @click="handleRefresh"
          >Replace value</DrButton>
        </template>
      </DrTextarea>

      <DrTextarea
        v-model="errorText"
        label="Error"
        :rows="3"
        :clearable="false"
        state="error"
        message="A comment is required."
        placeholder="Add a comment"
      />

      <DrTextarea
        v-model="disabledText"
        label="Disabled"
        :rows="3"
        disabled
      />
    </div>

    <DrButton
      variant="ghost"
      @click="handleRefresh"
    >Update from parent</DrButton>

    <p class="GalleryExample__output">Preview: {{ preview || 'No preview' }}</p>

    <p class="GalleryExample__output">{{ text || 'Empty note' }}</p>
  </div>
</template>
