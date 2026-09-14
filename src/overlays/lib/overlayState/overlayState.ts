import { computed, shallowRef } from 'vue';
import type { DrOverlayLayer } from '@/overlays/types';

const overlayLayersState = shallowRef<ReadonlyArray<DrOverlayLayer>>([]);

export const overlayLayers = computed<ReadonlyArray<DrOverlayLayer>>(() => overlayLayersState.value);

export function addOverlayLayer(layer: DrOverlayLayer) {
  overlayLayersState.value = [...overlayLayersState.value, layer];
}

export function removeOverlayLayer(uid: number) {
  overlayLayersState.value = overlayLayersState.value.filter((layer) => layer.uid !== uid);
}
