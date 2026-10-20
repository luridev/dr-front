import { readonly, shallowRef } from 'vue';
import { maxToastDuration } from '@/feedback/toasts/config';
import { isSafeIntegerInRange } from '@/numbers/lib/isSafeIntegerInRange/isSafeIntegerInRange';
import { normalizeToString } from '@/strings/lib/normalizeToString/normalizeToString';
import type { DrToastItem, DrToastOptions, DrToastService } from '@/feedback/toasts/types';

export function createToastState() {
  const activeToast = shallowRef<DrToastItem>();
  const queuedToasts: Array<DrToastItem> = [];
  let uid = 0;
  let disposed = false;

  function show(options: DrToastOptions): number {
    if (disposed) {
      return 0;
    }

    const variant = options.variant ?? 'info';
    const normalizedTitle = normalizeToString(options.title);
    const title = normalizedTitle === '' ? undefined : normalizedTitle;
    const message = options.message.trim();
    const duration = isSafeIntegerInRange(options.duration, 1, maxToastDuration) ? options.duration : undefined;
    uid += 1;

    const toastItem: DrToastItem = {
      uid,
      key: JSON.stringify([variant, title, message]),
      variant,
      title,
      message,
      duration,
    };

    const currentToast = activeToast.value;

    if (currentToast?.key === toastItem.key) {
      activeToast.value = { ...toastItem, uid: currentToast.uid };

      return currentToast.uid;
    }

    const queuedToastIndex = queuedToasts.findIndex((queuedToast) => queuedToast.key === toastItem.key);

    if (queuedToastIndex !== -1) {
      const queuedToast = queuedToasts[queuedToastIndex];

      queuedToasts[queuedToastIndex] = { ...toastItem, uid: queuedToast.uid };

      return queuedToast.uid;
    }

    if (currentToast == null) {
      activeToast.value = toastItem;
    } else {
      queuedToasts.push(toastItem);
    }

    return toastItem.uid;
  }

  const service: DrToastService = {
    show,
    info: (options) => show({ ...options, variant: 'info' }),
    success: (options) => show({ ...options, variant: 'success' }),
    warning: (options) => show({ ...options, variant: 'warning' }),
    error: (options) => show({ ...options, variant: 'error' }),
  };

  function dismissToast(currentUid: number) {
    if (activeToast.value?.uid === currentUid) {
      activeToast.value = queuedToasts.shift();
    }
  }

  function dispose() {
    disposed = true;
    queuedToasts.length = 0;
    activeToast.value = undefined;
  }

  return { service, activeToast: readonly(activeToast), dismissToast, dispose };
}
