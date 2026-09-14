<script setup lang="ts">
import { computed, ref } from 'vue';
import { DrButton } from '@/index';
import type { DrButtonContractProps } from '@/actions/components/DrButton/DrButtonContract/types.support';

const props = withDefaults(defineProps<DrButtonContractProps>(), {
  incomingClass: 'DrButtonContract__incoming',
  conditionalClass: true,
});

const consumerClasses = computed(() => [
  props.incomingClass,
  { DrButtonContract__conditional: props.conditionalClass },
]);

const clicks = ref(0);
const pointerdowns = ref(0);
const unexpectedEvents = ref(0);

const ignoredAttrs = {
  style: 'opacity: 0.25;',
  'data-attrs-probe': 'unexpected',
  'aria-description': 'Unexpected description',
  name: 'unexpected-name',
  onMousedown: handleUnexpectedMousedown,
};

function handleClick(): void {
  clicks.value += 1;
}

function handlePointerdown(): void {
  pointerdowns.value += 1;
}

function handleUnexpectedMousedown(): void {
  unexpectedEvents.value += 1;
}
</script>

<template>
  <DrButton
    v-bind="ignoredAttrs"
    id="contract-button"
    :class="consumerClasses"
    :disabled="props.disabled"
    :loading="props.loading"
    @click="handleClick"
    @pointerdown="handlePointerdown"
  >
    Action
  </DrButton>

  <p data-testid="clicks">{{ clicks }}</p>

  <p data-testid="pointerdowns">{{ pointerdowns }}</p>

  <p data-testid="unexpected-events">{{ unexpectedEvents }}</p>
</template>
