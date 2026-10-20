<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import DrOverlayLayer from '@/overlays/components/DrOverlayLayer/DrOverlayLayer.vue';
import { drOverlayKey } from '@/overlays/keys';
import { createOverlayContext } from '@/overlays/lib/overlayContext/overlayContext';
import type { RenderedOverlayLayer, DrModalHostProps } from '@/overlays/components/DrModalHost/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrModalHostProps>();
const isMounted = ref(false);
const context = createOverlayContext();

provide(drOverlayKey, context);

const renderedLayers = computed<ReadonlyArray<RenderedOverlayLayer>>(() =>
  context.layers.value.map((layer) => ({
    layer,
    isTopLayer: context.isTop(layer.token),
    order: context.order(layer.token),
  })),
);

watch(
  () => (isMounted.value ? props.backgroundRoot : null),
  (root) => { context.setBackgroundRoot(root); },
  { flush: 'sync' },
);

onMounted(() => {
  isMounted.value = true;
});

onBeforeUnmount(() => {
  context.dispose();
});
</script>

<template>
  <slot></slot>

  <Teleport
    v-if="isMounted && props.backgroundRoot"
    :to="props.backgroundRoot.ownerDocument.body"
  >
    <div class="DrModalHost">
      <DrOverlayLayer
        v-for="renderedLayer in renderedLayers"
        :key="renderedLayer.layer.uid"
        :layer="renderedLayer.layer"
        :is-top-layer="renderedLayer.isTopLayer"
        :order="renderedLayer.order"
      />
    </div>
  </Teleport>
</template>

<style scoped>
  .DrModalHost {
    display: contents;
  }
</style>
