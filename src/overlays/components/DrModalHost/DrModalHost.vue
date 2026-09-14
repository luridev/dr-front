<script setup lang="ts">
/* eslint-disable vue/no-root-v-if -- Teleport hosts intentionally render nothing before client mount. */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import DrOverlayLayer from '@/overlays/components/DrOverlayLayer/DrOverlayLayer.vue';
import { overlayLayers } from '@/overlays/lib/overlayState/overlayState';
import type { RenderedOverlayLayer, DrModalHostProps } from '@/overlays/components/DrModalHost/types';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<DrModalHostProps>();
const isMounted = ref(false);

const renderedLayers = computed<ReadonlyArray<RenderedOverlayLayer>>(() =>
  overlayLayers.value.map((layer, index, layers) => ({
    layer,
    isTopLayer: index === layers.length - 1,
  })),
);

const hasLayers = computed(() => renderedLayers.value.length > 0);

let previousBodyOverflow: string | undefined;
let previousDocumentOverflow: string | undefined;
let lockedBackgroundRoot: HTMLElement | undefined;
let wasBackgroundRootInert = false;

function lockDocument(backgroundRoot: HTMLElement) {
  if (typeof document === 'undefined' || previousBodyOverflow != null) {
    return;
  }

  previousBodyOverflow = document.body.style.overflow;
  previousDocumentOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  lockedBackgroundRoot = backgroundRoot;
  wasBackgroundRootInert = backgroundRoot.hasAttribute('inert');
  backgroundRoot.setAttribute('inert', '');
}

function unlockDocument() {
  if (previousBodyOverflow == null) {
    return;
  }

  document.body.style.overflow = previousBodyOverflow;
  document.documentElement.style.overflow = previousDocumentOverflow ?? '';

  if (lockedBackgroundRoot != null && !wasBackgroundRootInert) {
    lockedBackgroundRoot.removeAttribute('inert');
  }

  previousBodyOverflow = undefined;
  previousDocumentOverflow = undefined;
  lockedBackgroundRoot = undefined;
  wasBackgroundRootInert = false;
}

watch(
  [hasLayers, () => (isMounted.value ? props.backgroundRoot : null)],
  ([hasOpenLayers, backgroundRoot]) => {
    if (!hasOpenLayers || lockedBackgroundRoot !== backgroundRoot) {
      unlockDocument();
    }

    if (hasOpenLayers && backgroundRoot != null) {
      lockDocument(backgroundRoot);
    }
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  isMounted.value = true;
});

onBeforeUnmount(() => {
  unlockDocument();
});
</script>

<template>
  <Teleport
    v-if="isMounted && props.backgroundRoot"
    to="body"
  >
    <div class="DrModalHost">
      <DrOverlayLayer
        v-for="renderedLayer in renderedLayers"
        :key="renderedLayer.layer.uid"
        :layer="renderedLayer.layer"
        :is-top-layer="renderedLayer.isTopLayer"
      />
    </div>
  </Teleport>
</template>

<style scoped>
  .DrModalHost {
    position: fixed;
    z-index: var(--dr-layer-overlay);
    inset: 0;
    pointer-events: none;
  }
</style>
