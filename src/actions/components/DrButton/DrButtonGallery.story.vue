<script setup lang="ts">
import { ref } from 'vue';
import { DrArrowLeftIcon, DrCheckIcon, DrCloseIcon } from '@/icons';
import { DrButton, DrCheckbox, DrIconButton, DrOutput, DrSection } from '@/index';

defineOptions({ inheritAttrs: false });

const disabled = ref(false);
const loading = ref(false);
const clicks = ref(0);

function handleClick() {
  clicks.value += 1;
}

function handleReset() {
  clicks.value = 0;
}
</script>

<template>
  <div class="GalleryExample">
    <DrSection title="Variants">
      <div class="GalleryExample__row">
        <DrCheckbox
          v-model="disabled"
          label="Disabled"
        />

        <DrCheckbox
          v-model="loading"
          label="Loading"
        />
      </div>

      <div class="GalleryExample__row">
        <DrButton
          variant="solid"
          :disabled="disabled"
          :loading="loading"
          @click="handleClick"
        >
          <DrCheckIcon />
          Save
        </DrButton>

        <DrButton
          variant="outline"
          :disabled="disabled"
          :loading="loading"
          @click="handleClick"
        >
          Outline
        </DrButton>

        <DrButton
          variant="ghost"
          :disabled="disabled"
          :loading="loading"
          @click="handleClick"
        >
          <DrArrowLeftIcon />
          Back
        </DrButton>
      </div>

      <DrOutput>Clicks: {{ clicks }}</DrOutput>
    </DrSection>

    <DrSection title="Sizes and states">
      <div class="GalleryExample__row">
        <DrButton
          size="small"
          @click="handleClick"
        >Small</DrButton>

        <DrButton
          size="medium"
          @click="handleClick"
        >Medium</DrButton>

        <DrButton
          size="large"
          @click="handleClick"
        >Large</DrButton>
      </div>

      <div class="GalleryExample__row">
        <DrButton
          class="DrButtonGallery__messageButton"
          state="warning"
          message="Unsaved changes"
          @click="handleClick"
        >
          Continue
        </DrButton>

        <DrButton
          class="DrButtonGallery__messageButton"
          state="danger"
          variant="solid"
          message="Resets all clicks"
          @click="handleReset"
        >
          Reset count
        </DrButton>

        <DrButton disabled>Disabled</DrButton>
      </div>
    </DrSection>

    <DrSection title="Icon buttons">
      <div class="GalleryExample__row">
        <DrIconButton
          class="DrButtonGallery__iconButton"
          :aria="{ ariaLabel: 'Reset count' }"
          @click="handleReset"
        >
          <DrCloseIcon :size="24" />
        </DrIconButton>

        <DrIconButton
          class="DrButtonGallery__iconButton"
          :aria="{ ariaLabel: 'Save unavailable' }"
          disabled
        >
          <DrCheckIcon :size="24" />
        </DrIconButton>
      </div>
    </DrSection>
  </div>
</template>

<style scoped>
  .DrButtonGallery__messageButton {
    width: fit-content;
  }

  .DrButtonGallery__iconButton {
    width: 44px;
    height: 44px;
    border: 1px solid var(--dr-color-border-primary);
    border-radius: var(--dr-border-radius-control);
  }

  .DrButtonGallery__iconButton:disabled {
    opacity: var(--dr-opacity-50);
  }
</style>
