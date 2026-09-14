<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import DrComponent from '@/dynamic-components/components/DrComponent/DrComponent.vue';
import type { DrOverlayLayerProps } from '@/overlays/components/DrOverlayLayer/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrOverlayLayerProps>();

function handleBackdropPointerdown() {
  if (props.isTopLayer && props.layer.closeOnBackdrop) {
    props.layer.close();
  }
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.isTopLayer || event.defaultPrevented) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  props.layer.close();
}

onMounted(() => {
  document.addEventListener('keydown', handleDocumentKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDocumentKeydown);
});
</script>

<template>
  <div
    class="DrOverlayLayer"
    :class="[{ DrOverlayLayer_top: props.isTopLayer }, $attrs.class]"
    :inert="props.isTopLayer ? undefined : true"
    :aria-hidden="props.isTopLayer ? undefined : true"
    @pointerdown.self="handleBackdropPointerdown"
  >
    <div class="DrOverlayLayer__content">
      <div class="DrOverlayLayer__contentValue">
        <DrComponent :definition="props.layer.content" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .DrOverlayLayer {
    position: absolute;
    inset: 0;
    isolation: isolate;
    display: grid;
    background: rgb(0 0 0 / 60%);
    pointer-events: none;
  }

  .DrOverlayLayer_top {
    pointer-events: auto;
  }

  .DrOverlayLayer__content {
    display: flex;
    grid-area: 1 / 1;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 0;
    padding: var(--dr-space-medium);
    pointer-events: none;
  }

  .DrOverlayLayer__contentValue {
    max-width: 100%;
    max-height: 100%;
    pointer-events: none;
  }

  .DrOverlayLayer_top .DrOverlayLayer__contentValue {
    pointer-events: auto;
  }
</style>
