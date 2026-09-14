import { readonly, shallowRef } from 'vue';
import type { DrToastItem } from '@/feedback/toasts/types';

const activeToastState = shallowRef<DrToastItem>();
const queuedToasts: Array<DrToastItem> = [];

export const activeToast = readonly(activeToastState);

export function enqueueToast(toastItem: DrToastItem): number {
  const currentToast = activeToastState.value;

  if (currentToast?.key === toastItem.key) {
    activeToastState.value = {
      ...toastItem,
      uid: currentToast.uid,
    };

    return currentToast.uid;
  }

  const queuedToastIndex = queuedToasts.findIndex((queuedToast) => queuedToast.key === toastItem.key);

  if (queuedToastIndex !== -1) {
    const queuedToast = queuedToasts[queuedToastIndex];

    queuedToasts[queuedToastIndex] = {
      ...toastItem,
      uid: queuedToast.uid,
    };

    return queuedToast.uid;
  }

  if (currentToast == null) {
    activeToastState.value = toastItem;
  } else {
    queuedToasts.push(toastItem);
  }

  return toastItem.uid;
}

export function dismissToast(currentUid: number) {
  const currentToast = activeToastState.value;

  if (currentToast?.uid !== currentUid) {
    return;
  }

  activeToastState.value = queuedToasts.shift();
}

export function clearToasts() {
  queuedToasts.length = 0;
  activeToastState.value = undefined;
}
