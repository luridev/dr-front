<script setup lang="ts">
import DrChevronDownIcon from '@/icons/components/DrChevronDownIcon/DrChevronDownIcon.generated.vue';
import type {
  DrExpandableSectionProps,
  DrExpandableSectionSlots,
} from '@/layout/components/DrExpandableSection/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrExpandableSectionProps>(), {
  disabled: false,
});

const slots = defineSlots<DrExpandableSectionSlots>();
</script>

<template>
  <details
    class="DrExpandableSection"
    :class="[{ DrExpandableSection_disabled: props.disabled }, $attrs.class]"
    :inert="props.disabled"
  >
    <summary class="DrExpandableSection__summary">
      <DrChevronDownIcon
        class="DrExpandableSection__icon"
        :size="12"
      />

      <span class="DrExpandableSection__title">
        {{ props.title }}
      </span>

      <span
        class="DrExpandableSection__divider"
        aria-hidden="true"
      ></span>
    </summary>

    <div class="DrExpandableSection__body">
      <div
        v-if="slots.params != null"
        class="DrExpandableSection__params"
      >
        <slot name="params"></slot>
      </div>

      <div class="DrExpandableSection__content">
        <slot></slot>
      </div>
    </div>
  </details>
</template>

<style scoped>
  .DrExpandableSection {
    min-width: 0;
  }

  .DrExpandableSection__summary {
    display: grid;
    grid-template-columns: auto auto minmax(0, 1fr);
    align-items: center;
    gap: var(--dr-space-small);
    min-width: 0;
    cursor: pointer;
    list-style: none;
  }

  .DrExpandableSection__summary::-webkit-details-marker {
    display: none;
  }

  .DrExpandableSection_disabled .DrExpandableSection__summary {
    cursor: var(--dr-disabled-cursor);
    opacity: var(--dr-opacity-65);
  }

  .DrExpandableSection:not(.DrExpandableSection_disabled) .DrExpandableSection__summary:focus-visible {
    border-radius: var(--dr-border-radius-control);
    outline: 2px solid var(--dr-color-border-accent);
    outline-offset: 2px;
  }

  .DrExpandableSection__icon {
    color: var(--dr-color-text-secondary);
    transition: transform 150ms ease;
  }

  .DrExpandableSection[open] .DrExpandableSection__icon {
    transform: rotate(180deg);
  }

  .DrExpandableSection_disabled[open] .DrExpandableSection__icon {
    transform: none;
  }

  .DrExpandableSection__title {
    color: var(--dr-color-text-secondary);
    font-size: var(--dr-font-size-medium);
    line-height: 1.3;
    white-space: nowrap;
  }

  .DrExpandableSection__divider {
    width: 100%;
    height: 1px;
    background: var(--dr-color-border-primary);
  }

  .DrExpandableSection__body {
    display: flex;
    flex-direction: column;
    gap: var(--dr-space-small);
    min-width: 0;
    padding-top: var(--dr-space-medium);
  }

  .DrExpandableSection_disabled .DrExpandableSection__body {
    display: none;
  }

  .DrExpandableSection__params {
    display: flex;
    align-items: center;
    gap: var(--dr-space-small);
  }

  .DrExpandableSection__content {
    min-width: 0;
  }
</style>
