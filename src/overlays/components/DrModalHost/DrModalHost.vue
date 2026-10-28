<script setup lang="ts">
import { computed, onMounted, onScopeDispose, provide, ref, useTemplateRef, watch } from 'vue';
import DrOverlayLayer from '@/overlays/components/DrOverlayLayer/DrOverlayLayer.vue';
import { useOverlayLifecycle } from '@/overlays/composables/useOverlayLifecycle/useOverlayLifecycle';
import { drOverlayKey } from '@/overlays/keys';
import { createOverlayContext } from '@/overlays/lib/overlayContext/overlayContext';
import type { RenderedOverlayLayer, DrModalHostProps } from '@/overlays/components/DrModalHost/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrModalHostProps>();
const isMounted = ref(false);
const context = createOverlayContext();
const portalTarget = useTemplateRef<HTMLElement>('portalTarget');

const isActive = useOverlayLifecycle(() => {
  context.closeAll(false);
});

const portalContainer = computed(() =>
  isMounted.value ? props.backgroundRoot?.ownerDocument.body ?? document.body : null,
);

provide(drOverlayKey, context);

const renderedLayers = computed<ReadonlyArray<RenderedOverlayLayer>>(() =>
  context.layers.value.filter((layer) => layer.content != null).map((layer) => ({
    layer,
    isTopLayer: context.isTop(layer.token),
    order: context.order(layer.token),
  })),
);

watch(
  () => (isMounted.value && isActive.value ? props.backgroundRoot : null),
  (root) => { context.setBackgroundRoot(root, isActive.value); },
  { flush: 'sync' },
);

watch([portalTarget, portalContainer], ([target]) => {
  context.setPortalTarget(target);
}, { flush: 'post' });

onMounted(() => {
  isMounted.value = true;
});

onScopeDispose(context.dispose);
</script>

<template>
  <slot></slot>

  <Teleport
    v-if="portalContainer != null"
    :to="portalContainer"
  >
    <div
      ref="portalTarget"
      class="DrModalHost"
    >
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
