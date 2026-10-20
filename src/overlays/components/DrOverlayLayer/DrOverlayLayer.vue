<script setup lang="ts">
import { computed, provide } from 'vue';
import DrComponent from '@/dynamic-components/components/DrComponent/DrComponent.vue';
import { drToastKey } from '@/feedback/toasts/keys';
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

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- The keyed layer snapshot is immutable.
provide(drToastKey, props.layer.context.toast);

const layerStyle = computed(() => ({ '--dr-overlay-layer-order': props.order }));
</script>

<template>
  <div
    class="DrOverlayLayer"
    :class="[{ DrOverlayLayer_top: props.isTopLayer }, $attrs.class]"
    :style="layerStyle"
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
    position: fixed;
    z-index: calc(var(--dr-layer-overlay) + var(--dr-overlay-layer-order));
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
