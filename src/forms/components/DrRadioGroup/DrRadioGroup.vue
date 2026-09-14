<script setup lang="ts" generic="T">
import { computed, useId } from 'vue';
import { useCollectionKeys } from '@/collections/composables/useCollectionKeys/useCollectionKeys';
import DrControl from '@/forms/components/DrControl/DrControl.vue';
import type { DrRadioGroupDirection, DrRadioGroupProps } from '@/forms/components/DrRadioGroup/types';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DrRadioGroupProps<T>>(), {
  direction: 'row',
  disabled: false,
  state: 'normal',
});

const model = defineModel<T>({ required: true });

const directionClasses = {
  row: 'DrRadioGroup_row',
  column: 'DrRadioGroup_column',
} as const satisfies Record<DrRadioGroupDirection, string>;

const getItemKey = useCollectionKeys(() => props.items);

const groupId = useId();

const groupName = computed(() => props.name ?? groupId);

function getItemId(item: T) {
  return `${groupId}-${getItemKey(item)}`;
}

function isChecked(item: T) {
  return model.value === item;
}
</script>

<template>
  <DrControl
    :class="$attrs.class"
    kind="group"
    :label-position="props.labelPosition"
    :disabled="props.disabled"
    :state="props.state"
    :message="props.message"
  >
    <template #label>
      <slot name="label">
        {{ props.label }}
      </slot>
    </template>

    <template #default="slot">
      <div
        class="DrRadioGroup__group"
        :class="directionClasses[props.direction]"
        role="radiogroup"
        :aria-labelledby="slot.labelId"
        :aria-describedby="slot.describedBy"
        :aria-invalid="slot.state === 'error' || undefined"
      >
        <label
          v-for="(item, index) in props.items"
          :key="getItemKey(item)"
          class="DrRadioGroup__item"
          :class="{ DrRadioGroup__item_disabled: slot.disabled }"
          :for="getItemId(item)"
        >
          <input
            :id="getItemId(item)"
            v-model="model"
            class="DrRadioGroup__input"
            type="radio"
            :name="groupName"
            :value="item"
            :disabled="slot.disabled"
          />

          <span class="DrRadioGroup__label">
            <slot
              name="item"
              :item="item"
              :index="index"
              :checked="isChecked(item)"
              :disabled="slot.disabled"
            ></slot>
          </span>
        </label>
      </div>
    </template>
  </DrControl>
</template>

<style scoped>
  .DrRadioGroup__group {
    display: flex;
    max-width: 100%;
    min-width: 0;
    gap: var(--dr-space-xsmall) var(--dr-space-medium);
    color: var(--dr-color-text-primary);
  }

  .DrRadioGroup_row {
    flex-flow: row wrap;
  }

  .DrRadioGroup_column {
    flex-direction: column;
    align-items: flex-start;
  }

  .DrRadioGroup__item {
    display: inline-grid;
    align-items: first baseline;
    min-width: 0;
    padding: var(--dr-space-xsmall) 0;
    gap: var(--dr-space-small);
    color: inherit;
    cursor: pointer;
    grid-template-columns: auto minmax(0, 1fr);
    line-height: 1.3;
  }

  .DrRadioGroup__item_disabled {
    cursor: var(--dr-disabled-cursor);
  }

  .DrRadioGroup__input {
    align-self: start;
    width: 16px;
    height: 16px;
    margin: 4px 0 0;
    accent-color: var(--dr-color-background-accent);
    cursor: inherit;
  }

  .DrRadioGroup__input:focus-visible {
    outline: 2px solid var(--dr-color-border-accent);
    outline-offset: 2px;
  }

  .DrRadioGroup__label {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .DrRadioGroup__item:not(.DrRadioGroup__item_disabled):hover {
    color: var(--dr-color-text-secondary);

    .DrRadioGroup__input {
      accent-color: var(--dr-color-text-secondary);
    }
  }
</style>
