<script setup lang="ts">
import { nextTick, onMounted, useId, useTemplateRef } from 'vue';
import DrIconButton from '@/actions/components/DrIconButton/DrIconButton.vue';
import DrCloseIcon from '@/icons/components/DrCloseIcon/DrCloseIcon.generated.vue';
import type { DrDialogProps, DrDialogSlots } from '@/dialogs/components/DrDialog/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrDialogProps>();
const slots = defineSlots<DrDialogSlots>();

const titleId = useId();
const panel = useTemplateRef<HTMLElement>('panel');

onMounted(async () => {
  await nextTick();

  const initialFocusElement = panel.value?.querySelector<HTMLElement>('[data-dr-dialog-initial-focus], [autofocus]');

  (initialFocusElement ?? panel.value)?.focus();
});
</script>

<template>
  <section
    :id="props.id"
    ref="panel"
    class="DrDialog"
    :class="$attrs.class"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    tabindex="-1"
  >
    <header class="DrDialog__header">
      <h2
        :id="titleId"
        class="DrDialog__title"
      >
        {{ props.title }}
      </h2>

      <DrIconButton
        class="DrDialog__close"
        :aria="{ ariaLabel: 'Закрыть' }"
        @click="props.close"
      >
        <DrCloseIcon :size="20" />
      </DrIconButton>
    </header>

    <div class="DrDialog__body">
      <slot></slot>
    </div>

    <footer
      v-if="slots.footer != null"
      class="DrDialog__footer"
    >
      <slot name="footer"></slot>
    </footer>
  </section>
</template>

<style scoped>
  .DrDialog {
    display: flex;
    flex-direction: column;
    width: min(32rem, calc(100vw - var(--dr-space-medium) * 2));
    max-height: calc(100vh - var(--dr-space-medium) * 2);
    max-height: calc(100dvh - var(--dr-space-medium) * 2);
    overflow: hidden;
    border: 1px solid var(--dr-color-border-primary);
    border-radius: var(--dr-border-radius-dialog);
    background: var(--dr-color-background-primary);
    color: var(--dr-color-text-primary);
    box-shadow: 0 1rem 3rem rgb(0 0 0 / 25%);
  }

  .DrDialog__header {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    gap: var(--dr-space-medium);
    padding: var(--dr-space-medium);
    border-bottom: 1px solid var(--dr-color-border-primary);
  }

  .DrDialog__title {
    margin: 0;
    font-size: var(--dr-font-size-large);
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .DrDialog__close {
    flex: none;
    width: 32px;
    height: 32px;
    border-radius: var(--dr-border-radius-control);
  }

  .DrDialog__close:hover {
    background: var(--dr-color-background-secondary);
  }

  .DrDialog__body {
    min-width: 0;
    min-height: 0;
    padding: var(--dr-space-large);
    overflow: auto;
  }

  .DrDialog__footer {
    display: flex;
    flex: none;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--dr-space-small);
    padding: var(--dr-space-medium);
    border-top: 1px solid var(--dr-color-border-primary);
  }
</style>
