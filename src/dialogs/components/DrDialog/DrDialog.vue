<script setup lang="ts">
import { computed, inject, provide, useId, useTemplateRef } from 'vue';
import DrIconButton from '@/actions/components/DrIconButton/DrIconButton.vue';
import { useDrTranslation } from '@/configuration/composables/useDrTranslation/useDrTranslation';
import DrCloseIcon from '@/icons/components/DrCloseIcon/DrCloseIcon.generated.vue';
import { dialogReturnFocusKey } from '@/overlays/lib/dialogFocus/dialogFocus';
import { useDialogFocus } from '@/overlays/lib/dialogFocus/useDialogFocus';
import { floatingScopeKey } from '@/overlays/lib/floatingScope/floatingScope';
import type { DrDialogProps, DrDialogSlots } from '@/dialogs/components/DrDialog/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrDialogProps>();

const slots = defineSlots<DrDialogSlots>();

const t = useDrTranslation();

const titleId = useId();
const dialogElement = useTemplateRef<HTMLElement>('dialogElement');
const floatingTarget = useTemplateRef<HTMLElement>('floatingTarget');
const owner = inject(floatingScopeKey, undefined);
const active = computed(() => owner?.active.value ?? true);

useDialogFocus({
  root: dialogElement,
  active,
  returnFocus: inject(dialogReturnFocusKey, undefined),
});

provide(floatingScopeKey, {
  target: floatingTarget,
  active,
});
</script>

<template>
  <section
    :id="props.id"
    ref="dialogElement"
    class="DrDialog"
    :class="$attrs.class"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    tabindex="-1"
    data-dr-focus-inset
  >
    <div class="DrDialog__panel">
      <header class="DrDialog__header">
        <h2
          :id="titleId"
          class="DrDialog__title"
        >
          {{ props.title }}
        </h2>

        <DrIconButton
          class="DrDialog__close"
          :aria="{ ariaLabel: t('dialog.close') }"
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
    </div>

    <div
      ref="floatingTarget"
      class="DrDialog__floating"
    ></div>
  </section>
</template>

<style scoped>
  .DrDialog {
    width: min(32rem, calc(100vw - var(--dr-space-medium) * 2));
    max-height: calc(100vh - var(--dr-space-medium) * 2);
    max-height: calc(100dvh - var(--dr-space-medium) * 2);
    border-radius: var(--dr-border-radius-dialog);
  }

  .DrDialog__panel {
    display: flex;
    flex-direction: column;
    max-height: inherit;
    overflow: hidden;
    border: 1px solid var(--dr-color-border-primary);
    border-radius: var(--dr-border-radius-dialog);
    background: var(--dr-color-background-primary);
    color: var(--dr-color-text-primary);
    box-shadow: 0 1rem 3rem rgb(0 0 0 / 25%);
  }

  .DrDialog__floating {
    display: contents;
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
